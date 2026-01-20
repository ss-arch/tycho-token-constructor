"""
Token Service for Tycho Testnet
Handles TIP-3 token deployment and management
"""
import logging
import json
import hashlib
import time
from typing import Optional
from dataclasses import dataclass

from config import TYCHO_NETWORK, TOKEN_DEFAULTS, DEMO_MODE
from contracts.tip3_root import TIP3_ROOT_ABI, TIP3_ROOT_TVC
from contracts.tip3_wallet import TIP3_WALLET_ABI, TIP3_WALLET_TVC
from .wallet_service import WalletService

logger = logging.getLogger(__name__)


@dataclass
class TokenParams:
    """Parameters for token deployment"""
    name: str
    symbol: str
    decimals: int = TOKEN_DEFAULTS["decimals"]
    initial_supply: int = TOKEN_DEFAULTS["initial_supply"]
    initial_supply_to: Optional[str] = None
    mint_disabled: bool = False
    burn_by_root_disabled: bool = False
    burn_paused: bool = False


@dataclass
class DeployedToken:
    """Result of token deployment"""
    address: str
    name: str
    symbol: str
    decimals: int
    initial_supply: int
    owner: str
    transaction_id: str
    explorer_url: str


# In-memory store for demo mode
_demo_tokens = {}


class TokenService:
    """Service for deploying and managing TIP-3 tokens"""

    def __init__(self, wallet_service: WalletService):
        self.wallet = wallet_service
        self.root_abi = TIP3_ROOT_ABI
        self.root_tvc = TIP3_ROOT_TVC
        self.wallet_abi = TIP3_WALLET_ABI
        self.wallet_tvc = TIP3_WALLET_TVC
        self.demo_mode = DEMO_MODE or wallet_service.demo_mode

    def _generate_demo_address(self, params: TokenParams) -> str:
        """Generate deterministic address for demo mode"""
        data = f"{params.name}{params.symbol}{params.decimals}{time.time()}"
        hash_bytes = hashlib.sha256(data.encode()).hexdigest()
        return f"0:{hash_bytes}"

    def _generate_demo_tx_id(self) -> str:
        """Generate demo transaction ID"""
        return hashlib.sha256(f"tx_{time.time()}".encode()).hexdigest()

    async def deploy_token(self, params: TokenParams) -> DeployedToken:
        """
        Deploy a new TIP-3 token root contract

        Args:
            params: Token parameters (name, symbol, decimals, etc.)

        Returns:
            DeployedToken with contract address and details
        """
        logger.info(f"Deploying token: {params.name} ({params.symbol})")

        if self.demo_mode:
            # Demo mode deployment
            contract_address = self._generate_demo_address(params)
            tx_id = self._generate_demo_tx_id()

            # Store in demo memory
            _demo_tokens[contract_address] = {
                "name": params.name,
                "symbol": params.symbol,
                "decimals": params.decimals,
                "total_supply": str(params.initial_supply),
                "root_owner": self.wallet.address,
                "balance": "1000000000"
            }

            logger.info(f"[DEMO] Token deployed at: {contract_address}")

            explorer_url = f"{TYCHO_NETWORK['explorer_url']}/accounts/{contract_address}"

            return DeployedToken(
                address=contract_address,
                name=params.name,
                symbol=params.symbol,
                decimals=params.decimals,
                initial_supply=params.initial_supply,
                owner=self.wallet.address,
                transaction_id=tx_id,
                explorer_url=explorer_url
            )

        # Real deployment
        if not self.wallet.client:
            raise RuntimeError("Wallet service not initialized")

        from tonclient.types import (
            Abi, CallSet, DeploySet,
            ParamsOfEncodeMessage, ParamsOfProcessMessage,
            ParamsOfEncodeStateInit
        )

        # Get wallet code for token root
        wallet_code = await self._encode_wallet_code()

        # Determine initial supply recipient
        initial_supply_to = params.initial_supply_to or self.wallet.address

        # Prepare deployment data
        initial_data = {
            "name_": params.name,
            "symbol_": params.symbol,
            "decimals_": params.decimals,
            "rootOwner_": self.wallet.address,
            "walletCode_": wallet_code
        }

        # Constructor parameters
        constructor_params = {
            "initialSupplyTo": initial_supply_to if params.initial_supply > 0 else "0:0000000000000000000000000000000000000000000000000000000000000000",
            "initialSupply": params.initial_supply,
            "deployWalletValue": 100_000_000,
            "mintDisabled": params.mint_disabled,
            "burnByRootDisabled": params.burn_by_root_disabled,
            "burnPaused": params.burn_paused,
            "remainingGasTo": self.wallet.address
        }

        # Encode deployment message
        deploy_set = DeploySet(
            tvc=self.root_tvc,
            initial_data=initial_data
        )

        encode_params = ParamsOfEncodeMessage(
            abi=Abi.Json(json.dumps(self.root_abi)),
            deploy_set=deploy_set,
            call_set=CallSet(function_name="constructor", input=constructor_params),
            signer=self.wallet.get_signer()
        )

        # Get future contract address
        encoded = await self.wallet.client.abi.encode_message(encode_params)
        contract_address = encoded.address

        logger.info(f"Token will be deployed at: {contract_address}")

        # Process deployment
        process_params = ParamsOfProcessMessage(
            message_encode_params=encode_params,
            send_events=False
        )

        result = await self.wallet.client.processing.process_message(process_params)
        tx_id = result.transaction.get("id", "unknown")

        logger.info(f"Token deployed successfully! TX: {tx_id}")

        explorer_url = f"{TYCHO_NETWORK['explorer_url']}/accounts/{contract_address}"

        return DeployedToken(
            address=contract_address,
            name=params.name,
            symbol=params.symbol,
            decimals=params.decimals,
            initial_supply=params.initial_supply,
            owner=self.wallet.address,
            transaction_id=tx_id,
            explorer_url=explorer_url
        )

    async def _encode_wallet_code(self) -> str:
        """Encode wallet code as cell for token root data"""
        if self.demo_mode:
            return "te6ccgEBAQEAAgAAAA=="

        if not self.wallet.client:
            raise RuntimeError("Wallet service not initialized")

        from tonclient.types import ParamsOfEncodeStateInit

        result = await self.wallet.client.boc.encode_state_init(
            ParamsOfEncodeStateInit(
                code=self.wallet_tvc,
                data=None
            )
        )
        return result.state_init

    async def get_token_info(self, token_address: str) -> dict:
        """Get information about a deployed token"""
        if self.demo_mode:
            if token_address in _demo_tokens:
                token = _demo_tokens[token_address]
                return {
                    "address": token_address,
                    "name": token["name"],
                    "symbol": token["symbol"],
                    "decimals": token["decimals"],
                    "total_supply": token["total_supply"],
                    "root_owner": token["root_owner"],
                    "balance": token["balance"],
                    "explorer_url": f"{TYCHO_NETWORK['explorer_url']}/accounts/{token_address}"
                }
            else:
                raise ValueError(f"Token not found at address: {token_address}")

        if not self.wallet.client:
            raise RuntimeError("Wallet service not initialized")

        from tonclient.types import ParamsOfQueryCollection

        # Query account to check if it exists
        result = await self.wallet.client.net.query_collection(
            ParamsOfQueryCollection(
                collection="accounts",
                filter={"id": {"eq": token_address}},
                result="id balance code_hash"
            )
        )

        if not result.result or len(result.result) == 0:
            raise ValueError(f"Token not found at address: {token_address}")

        account = result.result[0]

        # Call getters
        name_result = await self._call_getter(token_address, "name", {"answerId": 0})
        symbol_result = await self._call_getter(token_address, "symbol", {"answerId": 0})
        decimals_result = await self._call_getter(token_address, "decimals", {"answerId": 0})
        total_supply_result = await self._call_getter(token_address, "totalSupply", {"answerId": 0})
        root_owner_result = await self._call_getter(token_address, "rootOwner", {"answerId": 0})

        return {
            "address": token_address,
            "name": name_result.get("value0", ""),
            "symbol": symbol_result.get("value0", ""),
            "decimals": decimals_result.get("value0", 0),
            "total_supply": total_supply_result.get("value0", "0"),
            "root_owner": root_owner_result.get("value0", ""),
            "balance": account.get("balance", "0"),
            "explorer_url": f"{TYCHO_NETWORK['explorer_url']}/accounts/{token_address}"
        }

    async def _call_getter(self, address: str, function_name: str, params: dict) -> dict:
        """Call a getter function on a contract"""
        if not self.wallet.client:
            raise RuntimeError("Wallet service not initialized")

        from tonclient.types import (
            Abi, CallSet, Signer,
            ParamsOfEncodeMessage, ParamsOfQueryCollection, ParamsOfRunTvm
        )

        # Encode message
        encode_params = ParamsOfEncodeMessage(
            abi=Abi.Json(json.dumps(self.root_abi)),
            address=address,
            call_set=CallSet(function_name=function_name, input=params),
            signer=Signer.NoSigner()
        )

        encoded = await self.wallet.client.abi.encode_message(encode_params)

        # Get account state
        account_result = await self.wallet.client.net.query_collection(
            ParamsOfQueryCollection(
                collection="accounts",
                filter={"id": {"eq": address}},
                result="boc"
            )
        )

        if not account_result.result or len(account_result.result) == 0:
            raise ValueError(f"Account not found: {address}")

        account_boc = account_result.result[0]["boc"]

        # Run TVM
        run_result = await self.wallet.client.tvm.run_tvm(
            ParamsOfRunTvm(
                message=encoded.message,
                account=account_boc,
                abi=Abi.Json(json.dumps(self.root_abi))
            )
        )

        return run_result.decoded.output if run_result.decoded else {}

    async def mint_tokens(
        self,
        token_address: str,
        amount: int,
        recipient: str,
        notify: bool = False
    ) -> dict:
        """Mint new tokens to a recipient"""
        logger.info(f"Minting {amount} tokens to {recipient}")

        if self.demo_mode:
            if token_address in _demo_tokens:
                current = int(_demo_tokens[token_address]["total_supply"])
                _demo_tokens[token_address]["total_supply"] = str(current + amount)

            tx_id = self._generate_demo_tx_id()
            logger.info(f"[DEMO] Tokens minted! TX: {tx_id}")
            return {"id": tx_id}

        if not self.wallet.client:
            raise RuntimeError("Wallet service not initialized")

        params = {
            "amount": amount,
            "recipient": recipient,
            "deployWalletValue": 100_000_000,
            "remainingGasTo": self.wallet.address,
            "notify": notify,
            "payload": ""
        }

        result = await self.wallet.send_message(
            address=token_address,
            abi=self.root_abi,
            function_name="mint",
            params=params
        )

        logger.info(f"Tokens minted successfully! TX: {result.get('id', 'unknown')}")
        return result
