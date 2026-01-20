"""
Tests for WalletService
"""
import pytest
import os

os.environ["DEMO_MODE"] = "true"

from services.wallet_service import WalletService
from config import WALLET_CONFIG


class TestWalletServiceDemo:
    """Test WalletService in demo mode"""

    @pytest.mark.asyncio
    async def test_init_demo_mode(self):
        """Test wallet service initialization in demo mode"""
        service = WalletService()
        await service.init()

        assert service.demo_mode is True
        assert service.address == WALLET_CONFIG["address"]

        await service.close()

    @pytest.mark.asyncio
    async def test_get_balance_demo(self):
        """Test getting balance in demo mode"""
        service = WalletService()
        await service.init()

        balance = await service.get_balance()

        assert balance == 1000_000_000_000  # 1000 tokens
        assert isinstance(balance, int)

        await service.close()

    @pytest.mark.asyncio
    async def test_get_balance_formatted_demo(self):
        """Test getting formatted balance in demo mode"""
        service = WalletService()
        await service.init()

        balance = await service.get_balance_formatted()

        assert balance == 1000.0
        assert isinstance(balance, float)

        await service.close()

    @pytest.mark.asyncio
    async def test_get_signer_demo_returns_none(self):
        """Test that signer returns None in demo mode"""
        service = WalletService()
        await service.init()

        signer = service.get_signer()

        assert signer is None

        await service.close()

    @pytest.mark.asyncio
    async def test_generate_demo_address(self):
        """Test demo address generation"""
        service = WalletService()
        await service.init()

        address = service._generate_demo_address("test_data")

        assert address.startswith("0:")
        assert len(address) == 66  # 0: + 64 hex chars

        await service.close()

    @pytest.mark.asyncio
    async def test_generate_demo_tx_id(self):
        """Test demo transaction ID generation"""
        service = WalletService()
        await service.init()

        tx_id1 = service._generate_demo_tx_id()
        tx_id2 = service._generate_demo_tx_id()

        assert len(tx_id1) == 64  # SHA256 hex
        assert tx_id1 != tx_id2  # Should be unique

        await service.close()

    @pytest.mark.asyncio
    async def test_send_message_demo(self):
        """Test sending message in demo mode"""
        service = WalletService()
        await service.init()

        result = await service.send_message(
            address="0:test",
            abi={},
            function_name="test",
            params={}
        )

        assert "id" in result
        assert len(result["id"]) == 64

        await service.close()

    @pytest.mark.asyncio
    async def test_wait_for_transaction_demo(self):
        """Test waiting for transaction in demo mode"""
        service = WalletService()
        await service.init()

        result = await service.wait_for_transaction("test_tx_id")

        assert result["id"] == "test_tx_id"
        assert result["status"] == "confirmed"

        await service.close()


class TestWalletServiceAddress:
    """Test wallet address handling"""

    @pytest.mark.asyncio
    async def test_address_from_config(self):
        """Test that address is loaded from config"""
        service = WalletService()
        await service.init()

        assert service.address == WALLET_CONFIG["address"]

        await service.close()

    @pytest.mark.asyncio
    async def test_demo_address_format(self):
        """Test demo address format is valid"""
        service = WalletService()
        await service.init()

        address = service._generate_demo_address("test")

        # Valid TVM address format: 0:64_hex_chars
        assert address.startswith("0:")
        hex_part = address[2:]
        assert len(hex_part) == 64
        assert all(c in "0123456789abcdef" for c in hex_part)

        await service.close()
