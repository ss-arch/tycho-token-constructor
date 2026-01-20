"""
Tests for Pydantic models
"""
import pytest
from pydantic import ValidationError

from api.models import (
    TokenCreateRequest,
    TokenCreateResponse,
    TokenInfoResponse,
    MintRequest,
    MintResponse,
    WalletInfoResponse,
    HealthResponse,
    ErrorResponse
)


class TestTokenCreateRequest:
    """Test TokenCreateRequest model"""

    def test_valid_request(self):
        """Test valid token create request"""
        request = TokenCreateRequest(
            name="Test Token",
            symbol="TST",
            decimals=9,
            initial_supply=1000000
        )

        assert request.name == "Test Token"
        assert request.symbol == "TST"
        assert request.decimals == 9
        assert request.initial_supply == 1000000

    def test_minimal_request(self):
        """Test request with only required fields"""
        request = TokenCreateRequest(name="Test", symbol="T")

        assert request.name == "Test"
        assert request.symbol == "T"
        assert request.decimals == 9  # Default
        assert request.initial_supply == 0  # Default
        assert request.mint_disabled is False

    def test_name_too_long(self):
        """Test name validation (max 64 chars)"""
        with pytest.raises(ValidationError):
            TokenCreateRequest(name="x" * 65, symbol="TST")

    def test_symbol_too_long(self):
        """Test symbol validation (max 16 chars)"""
        with pytest.raises(ValidationError):
            TokenCreateRequest(name="Test", symbol="x" * 17)

    def test_decimals_too_high(self):
        """Test decimals validation (max 18)"""
        with pytest.raises(ValidationError):
            TokenCreateRequest(name="Test", symbol="TST", decimals=19)

    def test_decimals_negative(self):
        """Test decimals validation (min 0)"""
        with pytest.raises(ValidationError):
            TokenCreateRequest(name="Test", symbol="TST", decimals=-1)

    def test_initial_supply_negative(self):
        """Test initial supply validation (min 0)"""
        with pytest.raises(ValidationError):
            TokenCreateRequest(name="Test", symbol="TST", initial_supply=-1)


class TestTokenCreateResponse:
    """Test TokenCreateResponse model"""

    def test_valid_response(self):
        """Test valid token create response"""
        response = TokenCreateResponse(
            success=True,
            address="0:abc123",
            name="Test",
            symbol="TST",
            decimals=9,
            initial_supply=1000,
            owner="0:owner",
            transaction_id="tx123",
            explorer_url="https://example.com"
        )

        assert response.success is True
        assert response.address == "0:abc123"


class TestMintRequest:
    """Test MintRequest model"""

    def test_valid_request(self):
        """Test valid mint request"""
        request = MintRequest(
            token_address="0:token",
            amount=1000,
            recipient="0:recipient"
        )

        assert request.token_address == "0:token"
        assert request.amount == 1000
        assert request.notify is False  # Default

    def test_amount_must_be_positive(self):
        """Test amount must be > 0"""
        with pytest.raises(ValidationError):
            MintRequest(
                token_address="0:token",
                amount=0,
                recipient="0:recipient"
            )

    def test_with_notify(self):
        """Test mint request with notify"""
        request = MintRequest(
            token_address="0:token",
            amount=1000,
            recipient="0:recipient",
            notify=True
        )

        assert request.notify is True


class TestWalletInfoResponse:
    """Test WalletInfoResponse model"""

    def test_valid_response(self):
        """Test valid wallet info response"""
        response = WalletInfoResponse(
            address="0:wallet",
            balance=100.5,
            balance_nano=100500000000,
            network="Tycho Testnet"
        )

        assert response.address == "0:wallet"
        assert response.balance == 100.5
        assert response.balance_nano == 100500000000


class TestHealthResponse:
    """Test HealthResponse model"""

    def test_valid_response(self):
        """Test valid health response"""
        response = HealthResponse(
            status="healthy",
            network="Tycho Testnet",
            wallet_address="0:wallet",
            wallet_balance=1000.0
        )

        assert response.status == "healthy"


class TestErrorResponse:
    """Test ErrorResponse model"""

    def test_error_response(self):
        """Test error response"""
        response = ErrorResponse(
            error="Something went wrong",
            detail="More details here"
        )

        assert response.success is False
        assert response.error == "Something went wrong"
        assert response.detail == "More details here"

    def test_error_without_detail(self):
        """Test error response without detail"""
        response = ErrorResponse(error="Error message")

        assert response.detail is None
