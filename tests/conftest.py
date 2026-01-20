"""
Pytest configuration and fixtures
"""
import os
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock

# Set demo mode for testing
os.environ["DEMO_MODE"] = "true"

from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport

from api.app import app, wallet_service, token_service
from services.wallet_service import WalletService
from services.token_service import TokenService, TokenParams


@pytest.fixture
def test_client():
    """Synchronous test client for FastAPI"""
    with TestClient(app) as client:
        yield client


@pytest_asyncio.fixture
async def async_client():
    """Async test client for FastAPI"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def wallet_service_demo():
    """Wallet service in demo mode"""
    service = WalletService()
    await service.init()
    yield service
    await service.close()


@pytest_asyncio.fixture
async def token_service_demo(wallet_service_demo):
    """Token service in demo mode"""
    service = TokenService(wallet_service_demo)
    yield service


@pytest.fixture
def sample_token_params():
    """Sample token parameters for testing"""
    return TokenParams(
        name="Test Token",
        symbol="TST",
        decimals=9,
        initial_supply=1000000000000,
        mint_disabled=False,
        burn_by_root_disabled=False,
        burn_paused=False
    )


@pytest.fixture
def sample_token_request():
    """Sample token create request payload"""
    return {
        "name": "Test Token",
        "symbol": "TST",
        "decimals": 9,
        "initial_supply": 1000000000000,
        "mint_disabled": False,
        "burn_by_root_disabled": False,
        "burn_paused": False
    }
