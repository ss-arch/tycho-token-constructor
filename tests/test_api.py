"""
Tests for FastAPI endpoints
"""
import pytest
import os

os.environ["DEMO_MODE"] = "true"

from fastapi.testclient import TestClient
from api.app import app
from services.token_service import _demo_tokens


@pytest.fixture
def client():
    """Test client fixture"""
    with TestClient(app) as c:
        yield c


class TestGeneralEndpoints:
    """Test general API endpoints"""

    def test_root_returns_html(self, client):
        """Test root endpoint serves HTML"""
        response = client.get("/")

        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
        assert "Tycho Token Constructor" in response.text

    def test_api_info(self, client):
        """Test API info endpoint"""
        response = client.get("/api")

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Tycho Token Constructor"
        assert data["version"] == "1.0.0"
        assert data["network"] == "Tycho Testnet"
        assert data["docs_url"] == "/docs"

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["network"] == "Tycho Testnet"
        assert "wallet_address" in data
        assert "wallet_balance" in data


class TestWalletEndpoints:
    """Test wallet API endpoints"""

    def test_get_wallet_info(self, client):
        """Test wallet info endpoint"""
        response = client.get("/wallet")

        assert response.status_code == 200
        data = response.json()
        assert "address" in data
        assert "balance" in data
        assert "balance_nano" in data
        assert data["network"] == "Tycho Testnet"
        assert data["balance"] == 1000.0  # Demo mode balance


class TestTokenEndpoints:
    """Test token API endpoints"""

    def test_create_token_success(self, client):
        """Test successful token creation"""
        _demo_tokens.clear()

        payload = {
            "name": "API Test Token",
            "symbol": "ATT",
            "decimals": 9,
            "initial_supply": 1000000000
        }

        response = client.post("/tokens", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["name"] == "API Test Token"
        assert data["symbol"] == "ATT"
        assert data["decimals"] == 9
        assert data["initial_supply"] == 1000000000
        assert data["address"].startswith("0:")
        assert len(data["transaction_id"]) == 64
        assert "explorer_url" in data

    def test_create_token_minimal(self, client):
        """Test token creation with minimal parameters"""
        payload = {
            "name": "Minimal Token",
            "symbol": "MIN"
        }

        response = client.post("/tokens", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Minimal Token"
        assert data["symbol"] == "MIN"
        assert data["decimals"] == 9  # Default
        assert data["initial_supply"] == 0  # Default

    def test_create_token_with_options(self, client):
        """Test token creation with all options"""
        payload = {
            "name": "Full Options Token",
            "symbol": "FOT",
            "decimals": 6,
            "initial_supply": 5000000,
            "mint_disabled": True,
            "burn_by_root_disabled": True,
            "burn_paused": True
        }

        response = client.post("/tokens", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["decimals"] == 6
        assert data["initial_supply"] == 5000000

    def test_create_token_missing_name(self, client):
        """Test token creation fails without name"""
        payload = {"symbol": "TST"}

        response = client.post("/tokens", json=payload)

        assert response.status_code == 422  # Validation error

    def test_create_token_missing_symbol(self, client):
        """Test token creation fails without symbol"""
        payload = {"name": "Test"}

        response = client.post("/tokens", json=payload)

        assert response.status_code == 422

    def test_create_token_invalid_decimals(self, client):
        """Test token creation fails with invalid decimals"""
        payload = {
            "name": "Test",
            "symbol": "TST",
            "decimals": 25  # Max is 18
        }

        response = client.post("/tokens", json=payload)

        assert response.status_code == 422

    def test_get_token_info_success(self, client):
        """Test getting token info"""
        _demo_tokens.clear()

        # First create a token
        create_response = client.post("/tokens", json={
            "name": "Info Test",
            "symbol": "INF",
            "decimals": 9
        })
        token_address = create_response.json()["address"]

        # Then get info
        response = client.get(f"/tokens/{token_address}")

        assert response.status_code == 200
        data = response.json()
        assert data["address"] == token_address
        assert data["name"] == "Info Test"
        assert data["symbol"] == "INF"

    def test_get_token_info_not_found(self, client):
        """Test getting info for non-existent token"""
        _demo_tokens.clear()

        response = client.get("/tokens/0:nonexistent_address_123456789")

        assert response.status_code == 404

    def test_mint_tokens_success(self, client):
        """Test minting tokens"""
        _demo_tokens.clear()

        # Create token first
        create_response = client.post("/tokens", json={
            "name": "Mint Test",
            "symbol": "MNT"
        })
        token_address = create_response.json()["address"]

        # Mint tokens
        mint_payload = {
            "token_address": token_address,
            "amount": 1000000000,
            "recipient": "0:recipient_address_here",
            "notify": False
        }

        response = client.post("/tokens/mint", json=mint_payload)

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "transaction_id" in data
        assert "message" in data

    def test_mint_tokens_missing_address(self, client):
        """Test minting fails without token address"""
        payload = {
            "amount": 1000,
            "recipient": "0:recipient"
        }

        response = client.post("/tokens/mint", json=payload)

        assert response.status_code == 422

    def test_mint_tokens_invalid_amount(self, client):
        """Test minting fails with invalid amount"""
        payload = {
            "token_address": "0:token",
            "amount": 0,  # Must be > 0
            "recipient": "0:recipient"
        }

        response = client.post("/tokens/mint", json=payload)

        assert response.status_code == 422


class TestStaticFiles:
    """Test static file serving"""

    def test_css_file(self, client):
        """Test CSS file is served"""
        response = client.get("/static/css/style.css")

        assert response.status_code == 200
        assert "text/css" in response.headers["content-type"]

    def test_js_file(self, client):
        """Test JS file is served"""
        response = client.get("/static/js/app.js")

        assert response.status_code == 200
        assert "javascript" in response.headers["content-type"]

    def test_nonexistent_static_file(self, client):
        """Test 404 for non-existent static file"""
        response = client.get("/static/nonexistent.js")

        assert response.status_code == 404


class TestOpenAPIDocs:
    """Test OpenAPI documentation"""

    def test_swagger_docs(self, client):
        """Test Swagger UI is accessible"""
        response = client.get("/docs")

        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]

    def test_redoc(self, client):
        """Test ReDoc is accessible"""
        response = client.get("/redoc")

        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]

    def test_openapi_json(self, client):
        """Test OpenAPI schema is accessible"""
        response = client.get("/openapi.json")

        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "paths" in data
        assert "/tokens" in data["paths"]
