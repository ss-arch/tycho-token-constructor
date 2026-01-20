"""
Wallet Service for Tycho Testnet
Handles wallet operations and transaction signing
"""
import logging
import json
import hashlib
import time
from typing import Optional

from config import TYCHO_NETWORK, WALLET_CONFIG, DEMO_MODE

logger = logging.getLogger(__name__)


class WalletService:
    """Service for managing wallet operations on Tycho testnet"""

    def __init__(self):
        self.client = None
        self.keypair = None
        self.address: str = WALLET_CONFIG["address"]
        self.demo_mode = DEMO_MODE
        self._demo_balance = 1000_000_000_000  # 1000 tokens in demo mode

    async def init(self):
        """Initialize TonClient connection"""
        if self.demo_mode:
            logger.info(f"[DEMO MODE] Wallet service initialized for {TYCHO_NETWORK['name']}")
            logger.info(f"[DEMO MODE] Wallet address: {self.address}")
            return

        try:
            from tonclient.client import TonClient, ClientConfig
            from tonclient.types import KeyPair

            config = ClientConfig()
            config.network.endpoints = [TYCHO_NETWORK["endpoint"]]
            self.client = TonClient(config=config, is_async=True)

            if WALLET_CONFIG["public_key"] and WALLET_CONFIG["secret_key"]:
                self.keypair = KeyPair(
                    public=WALLET_CONFIG["public_key"],
                    secret=WALLET_CONFIG["secret_key"]
                )

            logger.info(f"Wallet service initialized for {TYCHO_NETWORK['name']}")
            logger.info(f"Wallet address: {self.address}")
        except ImportError:
            logger.warning("tonclient not installed, running in demo mode")
            self.demo_mode = True
        except Exception as e:
            logger.warning(f"Failed to init client: {e}, running in demo mode")
            self.demo_mode = True

    async def close(self):
        """Close client connection"""
        if self.client:
            self.client.destroy()

    async def get_balance(self) -> int:
        """Get wallet balance in nano tokens"""
        if self.demo_mode:
            return self._demo_balance

        if not self.client:
            raise RuntimeError("Wallet service not initialized")

        from tonclient.types import ParamsOfQueryCollection

        result = await self.client.net.query_collection(
            ParamsOfQueryCollection(
                collection="accounts",
                filter={"id": {"eq": self.address}},
                result="balance"
            )
        )

        if result.result and len(result.result) > 0:
            balance_hex = result.result[0].get("balance", "0x0")
            return int(balance_hex, 16) if balance_hex.startswith("0x") else int(balance_hex)
        return 0

    async def get_balance_formatted(self) -> float:
        """Get wallet balance in tokens (divided by 1e9)"""
        balance_nano = await self.get_balance()
        return balance_nano / 1_000_000_000

    def get_signer(self):
        """Get signer for transactions"""
        if self.demo_mode:
            return None

        from tonclient.types import Signer

        if not self.keypair:
            raise ValueError("Wallet keypair not configured")
        return Signer.Keys(self.keypair)

    def _generate_demo_address(self, data: str) -> str:
        """Generate a deterministic demo address from data"""
        hash_bytes = hashlib.sha256(data.encode()).hexdigest()
        return f"0:{hash_bytes}"

    def _generate_demo_tx_id(self) -> str:
        """Generate a demo transaction ID"""
        return hashlib.sha256(f"{time.time()}".encode()).hexdigest()

    async def send_message(
        self,
        address: str,
        abi: dict,
        function_name: str,
        params: dict
    ) -> dict:
        """Send a message to a contract"""
        if self.demo_mode:
            tx_id = self._generate_demo_tx_id()
            logger.info(f"[DEMO] Message sent to {address}, tx: {tx_id}")
            return {"id": tx_id}

        if not self.client:
            raise RuntimeError("Wallet service not initialized")

        from tonclient.types import (
            Abi, CallSet,
            ParamsOfEncodeMessage, ParamsOfProcessMessage
        )

        encode_params = ParamsOfEncodeMessage(
            abi=Abi.Json(json.dumps(abi)),
            address=address,
            call_set=CallSet(function_name=function_name, input=params),
            signer=self.get_signer()
        )

        process_params = ParamsOfProcessMessage(
            message_encode_params=encode_params,
            send_events=False
        )

        result = await self.client.processing.process_message(process_params)

        logger.info(f"Message sent to {address}, tx: {result.transaction.get('id', 'unknown')}")
        return result.transaction

    async def wait_for_transaction(self, tx_id: str, timeout: int = 60000) -> dict:
        """Wait for a transaction to be confirmed"""
        if self.demo_mode:
            return {"id": tx_id, "status": "confirmed"}

        if not self.client:
            raise RuntimeError("Wallet service not initialized")

        from tonclient.types import ParamsOfWaitForCollection

        result = await self.client.net.wait_for_collection(
            ParamsOfWaitForCollection(
                collection="transactions",
                filter={"id": {"eq": tx_id}},
                result="id status",
                timeout=timeout
            )
        )
        return result.result
