"""
FastAPI Application for Tycho Token Constructor
"""
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from config import TYCHO_NETWORK, API_CONFIG, LOG_LEVEL
from services.wallet_service import WalletService
from services.token_service import TokenService, TokenParams
from .models import (
    TokenCreateRequest, TokenCreateResponse,
    TokenInfoResponse, MintRequest, MintResponse,
    WalletInfoResponse, HealthResponse, ErrorResponse
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Global services
wallet_service: WalletService = None
token_service: TokenService = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global wallet_service, token_service

    # Startup
    logger.info("Starting Tycho Token Constructor...")
    wallet_service = WalletService()
    await wallet_service.init()
    token_service = TokenService(wallet_service)

    balance = await wallet_service.get_balance_formatted()
    logger.info(f"Wallet balance: {balance:.4f} tokens")

    yield

    # Shutdown
    logger.info("Shutting down...")
    if wallet_service:
        await wallet_service.close()


# Create FastAPI app
app = FastAPI(
    title="Tycho Token Constructor",
    description="API for deploying TIP-3 tokens on Tycho Testnet",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount static files
STATIC_DIR = Path(__file__).parent.parent / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/", tags=["General"])
async def root():
    """Serve the web interface"""
    return FileResponse(str(STATIC_DIR / "index.html"))


@app.get("/api", tags=["General"])
async def api_info():
    """API info endpoint"""
    return {
        "name": "Tycho Token Constructor",
        "version": "1.0.0",
        "network": TYCHO_NETWORK["name"],
        "docs_url": "/docs"
    }


@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    """Health check endpoint"""
    try:
        balance = await wallet_service.get_balance_formatted()
        return HealthResponse(
            status="healthy",
            network=TYCHO_NETWORK["name"],
            wallet_address=wallet_service.address,
            wallet_balance=balance
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")


@app.get("/wallet", response_model=WalletInfoResponse, tags=["Wallet"])
async def get_wallet_info():
    """Get server wallet information"""
    try:
        balance_nano = await wallet_service.get_balance()
        balance = balance_nano / 1_000_000_000
        return WalletInfoResponse(
            address=wallet_service.address,
            balance=balance,
            balance_nano=balance_nano,
            network=TYCHO_NETWORK["name"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post(
    "/tokens",
    response_model=TokenCreateResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    tags=["Tokens"]
)
async def create_token(request: TokenCreateRequest):
    """
    Deploy a new TIP-3 token

    Creates and deploys a new TIP-3 fungible token root contract on Tycho testnet.
    The server wallet pays for deployment fees.
    """
    try:
        params = TokenParams(
            name=request.name,
            symbol=request.symbol,
            decimals=request.decimals,
            initial_supply=request.initial_supply,
            initial_supply_to=request.initial_supply_to,
            mint_disabled=request.mint_disabled,
            burn_by_root_disabled=request.burn_by_root_disabled,
            burn_paused=request.burn_paused
        )

        result = await token_service.deploy_token(params)

        return TokenCreateResponse(
            success=True,
            address=result.address,
            name=result.name,
            symbol=result.symbol,
            decimals=result.decimals,
            initial_supply=result.initial_supply,
            owner=result.owner,
            transaction_id=result.transaction_id,
            explorer_url=result.explorer_url
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to deploy token: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/tokens/{token_address}",
    response_model=TokenInfoResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    tags=["Tokens"]
)
async def get_token_info(token_address: str):
    """
    Get token information

    Retrieves information about a deployed TIP-3 token by its address.
    """
    try:
        info = await token_service.get_token_info(token_address)
        return TokenInfoResponse(**info)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get token info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post(
    "/tokens/mint",
    response_model=MintResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    tags=["Tokens"]
)
async def mint_tokens(request: MintRequest):
    """
    Mint new tokens

    Mints new tokens to a specified recipient address.
    Only works if the server wallet is the token root owner.
    """
    try:
        result = await token_service.mint_tokens(
            token_address=request.token_address,
            amount=request.amount,
            recipient=request.recipient,
            notify=request.notify
        )

        return MintResponse(
            success=True,
            transaction_id=result.get("id", "unknown"),
            message=f"Minted {request.amount} tokens to {request.recipient}"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to mint tokens: {e}")
        raise HTTPException(status_code=500, detail=str(e))
