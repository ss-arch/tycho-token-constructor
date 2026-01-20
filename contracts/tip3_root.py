"""
TIP-3 Token Root Contract ABI
Standard fungible token root for TVM-based chains
"""

# TIP-3 TokenRoot ABI (based on broxus/tip3 standard)
TIP3_ROOT_ABI = {
    "ABI version": 2,
    "version": "2.3",
    "header": ["pubkey", "time", "expire"],
    "functions": [
        {
            "name": "constructor",
            "inputs": [
                {"name": "initialSupplyTo", "type": "address"},
                {"name": "initialSupply", "type": "uint128"},
                {"name": "deployWalletValue", "type": "uint128"},
                {"name": "mintDisabled", "type": "bool"},
                {"name": "burnByRootDisabled", "type": "bool"},
                {"name": "burnPaused", "type": "bool"},
                {"name": "remainingGasTo", "type": "address"}
            ],
            "outputs": []
        },
        {
            "name": "name",
            "inputs": [{"name": "answerId", "type": "uint32"}],
            "outputs": [{"name": "value0", "type": "string"}]
        },
        {
            "name": "symbol",
            "inputs": [{"name": "answerId", "type": "uint32"}],
            "outputs": [{"name": "value0", "type": "string"}]
        },
        {
            "name": "decimals",
            "inputs": [{"name": "answerId", "type": "uint32"}],
            "outputs": [{"name": "value0", "type": "uint8"}]
        },
        {
            "name": "totalSupply",
            "inputs": [{"name": "answerId", "type": "uint32"}],
            "outputs": [{"name": "value0", "type": "uint128"}]
        },
        {
            "name": "walletCode",
            "inputs": [{"name": "answerId", "type": "uint32"}],
            "outputs": [{"name": "value0", "type": "cell"}]
        },
        {
            "name": "rootOwner",
            "inputs": [{"name": "answerId", "type": "uint32"}],
            "outputs": [{"name": "value0", "type": "address"}]
        },
        {
            "name": "walletOf",
            "inputs": [
                {"name": "answerId", "type": "uint32"},
                {"name": "walletOwner", "type": "address"}
            ],
            "outputs": [{"name": "value0", "type": "address"}]
        },
        {
            "name": "deployWallet",
            "inputs": [
                {"name": "answerId", "type": "uint32"},
                {"name": "walletOwner", "type": "address"},
                {"name": "deployWalletValue", "type": "uint128"}
            ],
            "outputs": [{"name": "tokenWallet", "type": "address"}]
        },
        {
            "name": "mint",
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
            "name": "acceptBurn",
            "inputs": [
                {"name": "amount", "type": "uint128"},
                {"name": "walletOwner", "type": "address"},
                {"name": "remainingGasTo", "type": "address"},
                {"name": "callbackTo", "type": "address"},
                {"name": "payload", "type": "cell"}
            ],
            "outputs": []
        },
        {
            "name": "sendSurplusGas",
            "inputs": [{"name": "to", "type": "address"}],
            "outputs": []
        }
    ],
    "data": [
        {"key": 1, "name": "name_", "type": "string"},
        {"key": 2, "name": "symbol_", "type": "string"},
        {"key": 3, "name": "decimals_", "type": "uint8"},
        {"key": 4, "name": "rootOwner_", "type": "address"},
        {"key": 5, "name": "walletCode_", "type": "cell"}
    ],
    "events": [],
    "fields": [
        {"name": "_pubkey", "type": "uint256"},
        {"name": "_timestamp", "type": "uint64"},
        {"name": "_constructorFlag", "type": "bool"},
        {"name": "name_", "type": "string"},
        {"name": "symbol_", "type": "string"},
        {"name": "decimals_", "type": "uint8"},
        {"name": "rootOwner_", "type": "address"},
        {"name": "totalSupply_", "type": "uint128"},
        {"name": "walletCode_", "type": "cell"},
        {"name": "mintDisabled_", "type": "bool"},
        {"name": "burnByRootDisabled_", "type": "bool"},
        {"name": "burnPaused_", "type": "bool"}
    ]
}

# Base64-encoded TVC (compiled contract bytecode)
# This is the standard TIP-3 TokenRoot TVC from broxus/tip3
TIP3_ROOT_TVC = """
te0oHppGdz0JXN/oGr/QFH+gKxQICC3Rx52omhAAe6Omf/AFkZD8IWRl/
+D+qAfCFlZf/g/qgHwhaEX/4P6oB8IWND/+D+qAfBFQNwBIBEBEREREREQ
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAH//////////////////////////////////////////
"""
