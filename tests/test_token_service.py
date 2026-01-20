"""
Tests for TokenService
"""
import pytest
import os

os.environ["DEMO_MODE"] = "true"

from services.wallet_service import WalletService
from services.token_service import TokenService, TokenParams, DeployedToken, _demo_tokens


class TestTokenServiceDemo:
    """Test TokenService in demo mode"""

    @pytest.mark.asyncio
    async def test_deploy_token_demo(self):
        """Test token deployment in demo mode"""
        wallet = WalletService()
        await wallet.init()
        service = TokenService(wallet)

        params = TokenParams(
            name="Test Token",
            symbol="TST",
            decimals=9,
            initial_supply=1000000000000
        )

        result = await service.deploy_token(params)

        assert isinstance(result, DeployedToken)
        assert result.name == "Test Token"
        assert result.symbol == "TST"
        assert result.decimals == 9
        assert result.initial_supply == 1000000000000
        assert result.address.startswith("0:")
        assert len(result.transaction_id) == 64
        assert "explorer_url" in result.__dict__

        await wallet.close()

    @pytest.mark.asyncio
    async def test_deploy_token_stored_in_memory(self):
        """Test that deployed token is stored in demo memory"""
        # Clear demo tokens
        _demo_tokens.clear()

        wallet = WalletService()
        await wallet.init()
        service = TokenService(wallet)

        params = TokenParams(name="Memory Test", symbol="MEM", decimals=6)
        result = await service.deploy_token(params)

        assert result.address in _demo_tokens
        assert _demo_tokens[result.address]["name"] == "Memory Test"
        assert _demo_tokens[result.address]["symbol"] == "MEM"
        assert _demo_tokens[result.address]["decimals"] == 6

        await wallet.close()

    @pytest.mark.asyncio
    async def test_get_token_info_demo(self):
        """Test getting token info in demo mode"""
        _demo_tokens.clear()

        wallet = WalletService()
        await wallet.init()
        service = TokenService(wallet)

        # Deploy a token first
        params = TokenParams(name="Info Test", symbol="INFO", decimals=9)
        deployed = await service.deploy_token(params)

        # Get info
        info = await service.get_token_info(deployed.address)

        assert info["address"] == deployed.address
        assert info["name"] == "Info Test"
        assert info["symbol"] == "INFO"
        assert info["decimals"] == 9

        await wallet.close()

    @pytest.mark.asyncio
    async def test_get_token_info_not_found(self):
        """Test getting info for non-existent token"""
        _demo_tokens.clear()

        wallet = WalletService()
        await wallet.init()
        service = TokenService(wallet)

        with pytest.raises(ValueError, match="Token not found"):
            await service.get_token_info("0:nonexistent")

        await wallet.close()

    @pytest.mark.asyncio
    async def test_mint_tokens_demo(self):
        """Test minting tokens in demo mode"""
        _demo_tokens.clear()

        wallet = WalletService()
        await wallet.init()
        service = TokenService(wallet)

        # Deploy token
        params = TokenParams(name="Mint Test", symbol="MINT", initial_supply=0)
        deployed = await service.deploy_token(params)

        # Mint tokens
        result = await service.mint_tokens(
            token_address=deployed.address,
            amount=5000000000,
            recipient="0:recipient_address"
        )

        assert "id" in result

        # Check supply updated
        assert _demo_tokens[deployed.address]["total_supply"] == "5000000000"

        await wallet.close()

    @pytest.mark.asyncio
    async def test_mint_tokens_accumulates(self):
        """Test that minting accumulates supply"""
        _demo_tokens.clear()

        wallet = WalletService()
        await wallet.init()
        service = TokenService(wallet)

        # Deploy with initial supply
        params = TokenParams(name="Accumulate", symbol="ACC", initial_supply=1000)
        deployed = await service.deploy_token(params)

        # Mint more
        await service.mint_tokens(deployed.address, 500, "0:recipient")
        await service.mint_tokens(deployed.address, 500, "0:recipient")

        assert _demo_tokens[deployed.address]["total_supply"] == "2000"

        await wallet.close()


class TestTokenParams:
    """Test TokenParams dataclass"""

    def test_default_values(self):
        """Test default parameter values"""
        params = TokenParams(name="Test", symbol="TST")

        assert params.decimals == 9
        assert params.initial_supply == 0
        assert params.initial_supply_to is None
        assert params.mint_disabled is False
        assert params.burn_by_root_disabled is False
        assert params.burn_paused is False

    def test_custom_values(self):
        """Test custom parameter values"""
        params = TokenParams(
            name="Custom",
            symbol="CUS",
            decimals=6,
            initial_supply=1000000,
            initial_supply_to="0:recipient",
            mint_disabled=True,
            burn_by_root_disabled=True,
            burn_paused=True
        )

        assert params.decimals == 6
        assert params.initial_supply == 1000000
        assert params.initial_supply_to == "0:recipient"
        assert params.mint_disabled is True
        assert params.burn_by_root_disabled is True
        assert params.burn_paused is True


class TestDeployedToken:
    """Test DeployedToken dataclass"""

    def test_deployed_token_fields(self):
        """Test DeployedToken has all required fields"""
        token = DeployedToken(
            address="0:abc123",
            name="Test",
            symbol="TST",
            decimals=9,
            initial_supply=1000,
            owner="0:owner",
            transaction_id="tx123",
            explorer_url="https://example.com/0:abc123"
        )

        assert token.address == "0:abc123"
        assert token.name == "Test"
        assert token.symbol == "TST"
        assert token.decimals == 9
        assert token.initial_supply == 1000
        assert token.owner == "0:owner"
        assert token.transaction_id == "tx123"
        assert token.explorer_url == "https://example.com/0:abc123"


class TestTokenAddressGeneration:
    """Test token address generation"""

    @pytest.mark.asyncio
    async def test_unique_addresses(self):
        """Test that each deployment gets a unique address"""
        _demo_tokens.clear()

        wallet = WalletService()
        await wallet.init()
        service = TokenService(wallet)

        addresses = []
        for i in range(5):
            params = TokenParams(name=f"Token{i}", symbol=f"T{i}")
            result = await service.deploy_token(params)
            addresses.append(result.address)

        # All addresses should be unique
        assert len(addresses) == len(set(addresses))

        await wallet.close()

    @pytest.mark.asyncio
    async def test_address_format(self):
        """Test deployed token address format"""
        wallet = WalletService()
        await wallet.init()
        service = TokenService(wallet)

        params = TokenParams(name="Format Test", symbol="FMT")
        result = await service.deploy_token(params)

        # Valid TVM address
        assert result.address.startswith("0:")
        assert len(result.address) == 66

        await wallet.close()
