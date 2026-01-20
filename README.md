# Tycho Token Constructor

A FastAPI-based web service for deploying TIP-3 tokens on Tycho Testnet.

## Features

- Deploy TIP-3 fungible tokens on Tycho testnet
- Get token information by address
- Mint tokens to recipients
- Server wallet pays deployment fees
- Auto-generated OpenAPI documentation

## Installation

```bash
# Clone or navigate to the project
cd tycho-token-constructor

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Tycho Testnet Configuration
TYCHO_ENDPOINT=https://testnet.tychoprotocol.com/graphql
TYCHO_EXPLORER_URL=https://testnet.tychoprotocol.com

# Server Wallet (for paying deployment fees)
WALLET_SEED_PHRASE=your twelve word seed phrase
WALLET_PUBLIC_KEY=your_public_key_hex
WALLET_SECRET_KEY=your_secret_key_hex
WALLET_ADDRESS=0:your_wallet_address

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

## Running

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### General

- `GET /` - Root endpoint with API info
- `GET /health` - Health check with wallet balance

### Wallet

- `GET /wallet` - Get server wallet information

### Tokens

- `POST /tokens` - Deploy a new TIP-3 token
- `GET /tokens/{address}` - Get token information
- `POST /tokens/mint` - Mint tokens to recipient

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Usage Examples

### Deploy a Token

```bash
curl -X POST http://localhost:8000/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Token",
    "symbol": "MTK",
    "decimals": 9,
    "initial_supply": 1000000000000000
  }'
```

Response:
```json
{
  "success": true,
  "address": "0:abc123...",
  "name": "My Token",
  "symbol": "MTK",
  "decimals": 9,
  "initial_supply": 1000000000000000,
  "owner": "0:server_wallet...",
  "transaction_id": "tx123...",
  "explorer_url": "https://testnet.tychoprotocol.com/accounts/0:abc123..."
}
```

### Get Token Info

```bash
curl http://localhost:8000/tokens/0:abc123...
```

### Mint Tokens

```bash
curl -X POST http://localhost:8000/tokens/mint \
  -H "Content-Type: application/json" \
  -d '{
    "token_address": "0:abc123...",
    "amount": 1000000000,
    "recipient": "0:def456..."
  }'
```

## Project Structure

```
tycho-token-constructor/
├── api/
│   ├── __init__.py
│   ├── app.py          # FastAPI application
│   └── models.py       # Pydantic models
├── contracts/
│   ├── __init__.py
│   ├── tip3_root.py    # TIP-3 root ABI
│   └── tip3_wallet.py  # TIP-3 wallet ABI
├── services/
│   ├── __init__.py
│   ├── wallet_service.py   # Wallet operations
│   └── token_service.py    # Token deployment
├── config.py           # Configuration
├── main.py             # Entry point
├── requirements.txt    # Dependencies
├── .env.example        # Environment template
└── README.md           # This file
```

## Token Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| name | string | required | Token name (max 64 chars) |
| symbol | string | required | Token symbol (max 16 chars) |
| decimals | int | 9 | Token decimals (0-18) |
| initial_supply | int | 0 | Initial supply in smallest units |
| initial_supply_to | string | server wallet | Address to receive initial supply |
| mint_disabled | bool | false | Disable minting after deployment |
| burn_by_root_disabled | bool | false | Disable burn by root owner |
| burn_paused | bool | false | Pause burn functionality |

## Notes

- The server wallet must have sufficient balance to pay deployment fees
- Token addresses are deterministic based on deployment parameters
- Initial supply is specified in smallest units (e.g., for 9 decimals: 1 token = 1000000000)
