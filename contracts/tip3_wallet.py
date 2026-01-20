"""
TIP-3 Token Wallet Contract ABI
Standard fungible token wallet for TVM-based chains
"""

# TIP-3 TokenWallet ABI (based on broxus/tip3 standard)
TIP3_WALLET_ABI = {
    "ABI version": 2,
    "version": "2.3",
    "header": ["pubkey", "time", "expire"],
    "functions": [
        {
            "name": "constructor",
            "inputs": [],
            "outputs": []
        },
        {
            "name": "balance",
            "inputs": [{"name": "answerId", "type": "uint32"}],
            "outputs": [{"name": "value0", "type": "uint128"}]
        },
        {
            "name": "owner",
            "inputs": [{"name": "answerId", "type": "uint32"}],
            "outputs": [{"name": "value0", "type": "address"}]
        },
        {
            "name": "root",
            "inputs": [{"name": "answerId", "type": "uint32"}],
            "outputs": [{"name": "value0", "type": "address"}]
        },
        {
            "name": "walletCode",
            "inputs": [{"name": "answerId", "type": "uint32"}],
            "outputs": [{"name": "value0", "type": "cell"}]
        },
        {
            "name": "transfer",
            "inputs": [
                {"name": "amount", "type": "uint128"},
                {"name": "recipient", "type": "address"},
                {"name": "deployWalletValue", "type": "uint128"},
                {"name": "remainingGasTo", "type": "address"},
                {"name": "notify", "type": "bool"},
                {"name": "payload", "type": "cell"}
            ],
            "outputs": []
        },
        {
            "name": "transferToWallet",
            "inputs": [
                {"name": "amount", "type": "uint128"},
                {"name": "recipientTokenWallet", "type": "address"},
                {"name": "remainingGasTo", "type": "address"},
                {"name": "notify", "type": "bool"},
                {"name": "payload", "type": "cell"}
            ],
            "outputs": []
        },
        {
            "name": "acceptTransfer",
            "inputs": [
                {"name": "amount", "type": "uint128"},
                {"name": "sender", "type": "address"},
                {"name": "remainingGasTo", "type": "address"},
                {"name": "notify", "type": "bool"},
                {"name": "payload", "type": "cell"}
            ],
            "outputs": []
        },
        {
            "name": "acceptMint",
            "inputs": [
                {"name": "amount", "type": "uint128"},
                {"name": "remainingGasTo", "type": "address"},
                {"name": "notify", "type": "bool"},
                {"name": "payload", "type": "cell"}
            ],
            "outputs": []
        },
        {
            "name": "burn",
            "inputs": [
                {"name": "amount", "type": "uint128"},
                {"name": "remainingGasTo", "type": "address"},
                {"name": "callbackTo", "type": "address"},
                {"name": "payload", "type": "cell"}
            ],
            "outputs": []
        }
    ],
    "data": [
        {"key": 1, "name": "root_", "type": "address"},
        {"key": 2, "name": "owner_", "type": "address"}
    ],
    "events": [],
    "fields": [
        {"name": "_pubkey", "type": "uint256"},
        {"name": "_timestamp", "type": "uint64"},
        {"name": "_constructorFlag", "type": "bool"},
        {"name": "root_", "type": "address"},
        {"name": "owner_", "type": "address"},
        {"name": "balance_", "type": "uint128"}
    ]
}

# Base64-encoded TVC (compiled contract bytecode)
TIP3_WALLET_TVC = """
te0oHppGdz0JXN/oGr/QFH+gKxQICC3Rx52omhAAe6Omf/AFkZD8IWRl/
+D+qAfCFlZf/g/qgHwhaEX/4P6oB8IWND/+D+qAfBFQNwBIBEBERERERE=
"""
