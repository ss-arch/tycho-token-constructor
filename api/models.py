"""
Pydantic models for API requests and responses
"""
from typing import Optional
from pydantic import BaseModel, Field


class TokenCreateRequest(BaseModel):
    """Request model for creating a new token"""
    name: str = Field(..., min_length=1, max_length=64, description="Token name")
    symbol: str = Field(..., min_length=1, max_length=16, description="Token symbol")
    decimals: int = Field(default=9, ge=0, le=18, description="Token decimals")
    initial_supply: int = Field(default=0, ge=0, description="Initial token supply (in smallest units)")
    initial_supply_to: Optional[str] = Field(default=None, description="Address to receive initial supply")
    mint_disabled: bool = Field(default=False, description="Disable minting after deployment")
    burn_by_root_disabled: bool = Field(default=False, description="Disable burning by root owner")
    burn_paused: bool = Field(default=False, description="Pause burning")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "My Token",
                "symbol": "MTK",
                "decimals": 9,
                "initial_supply": 1000000000000000,
                "mint_disabled": False,
                "burn_by_root_disabled": False,
                "burn_paused": False
            }
        }


class TokenCreateResponse(BaseModel):
    """Response model for token creation"""
    success: bool
    address: str
    name: str
    symbol: str
    decimals: int
    initial_supply: int
    owner: str
    transaction_id: str
    explorer_url: str


class TokenInfoResponse(BaseModel):
    """Response model for token information"""
    address: str
    name: str
    symbol: str
    decimals: int
    total_supply: str
    root_owner: str
    balance: str
    explorer_url: str


class MintRequest(BaseModel):
    """Request model for minting tokens"""
    token_address: str = Field(..., description="Token root contract address")
    amount: int = Field(..., gt=0, description="Amount to mint (in smallest units)")
    recipient: str = Field(..., description="Recipient address")
    notify: bool = Field(default=False, description="Notify recipient about transfer")

    class Config:
        json_schema_extra = {
            "example": {
                "token_address": "0:abc123...",
                "amount": 1000000000,
                "recipient": "0:def456...",
                "notify": False
            }
        }


class MintResponse(BaseModel):
    """Response model for mint operation"""
    success: bool
    transaction_id: str
    message: str


class WalletInfoResponse(BaseModel):
    """Response model for wallet information"""
    address: str
    balance: float
    balance_nano: int
    network: str


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    network: str
    wallet_address: str
    wallet_balance: float


class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = False
    error: str
    detail: Optional[str] = None
