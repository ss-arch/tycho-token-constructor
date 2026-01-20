"""
Configuration for Tycho Testnet Token Constructor
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Tycho Testnet Configuration
TYCHO_NETWORK = {
    "name": "Tycho Testnet",
    "endpoint": os.getenv("TYCHO_ENDPOINT", "https://testnet.tychoprotocol.com/graphql"),
    "explorer_url": os.getenv("TYCHO_EXPLORER_URL", "https://testnet.tychoprotocol.com"),
}

# Server Wallet Configuration (for paying deployment fees)
WALLET_CONFIG = {
    "seed_phrase": os.getenv("WALLET_SEED_PHRASE", ""),
    "public_key": os.getenv("WALLET_PUBLIC_KEY", ""),
    "secret_key": os.getenv("WALLET_SECRET_KEY", ""),
    "address": os.getenv("WALLET_ADDRESS", ""),
}

# API Configuration
API_CONFIG = {
    "host": os.getenv("API_HOST", "0.0.0.0"),
    "port": int(os.getenv("API_PORT", "8000")),
    "debug": os.getenv("API_DEBUG", "false").lower() == "true",
}

# Token Defaults
TOKEN_DEFAULTS = {
    "decimals": 9,
    "initial_supply": 0,
}

# Logging Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Demo Mode (for testing without blockchain connection)
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"
