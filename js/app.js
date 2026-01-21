// Tycho Token Constructor - Pure Frontend with Sparx Wallet
// Deploys TIP-3 tokens directly via browser wallet without backend

// ============== TIP-3 Contract ABIs and TVCs ==============

// TokenRoot ABI (Broxus TIP-3 implementation)
const TokenRootAbi = {
    "ABI version": 2,
    "version": "2.2",
    "header": ["pubkey", "time", "expire"],
    "functions": [
        {
            "name": "constructor",
            "inputs": [
                {"name":"initialSupplyTo","type":"address"},
                {"name":"initialSupply","type":"uint128"},
                {"name":"deployWalletValue","type":"uint128"},
                {"name":"mintDisabled","type":"bool"},
                {"name":"burnByRootDisabled","type":"bool"},
                {"name":"burnPaused","type":"bool"},
                {"name":"remainingGasTo","type":"address"}
            ],
            "outputs": []
        },
        {
            "name": "supportsInterface",
            "inputs": [{"name":"answerId","type":"uint32"},{"name":"interfaceID","type":"uint32"}],
            "outputs": [{"name":"value0","type":"bool"}]
        },
        {
            "name": "disableMint",
            "inputs": [{"name":"answerId","type":"uint32"}],
            "outputs": [{"name":"value0","type":"bool"}]
        },
        {
            "name": "mintDisabled",
            "inputs": [{"name":"answerId","type":"uint32"}],
            "outputs": [{"name":"value0","type":"bool"}]
        },
        {
            "name": "burnTokens",
            "inputs": [
                {"name":"amount","type":"uint128"},
                {"name":"walletOwner","type":"address"},
                {"name":"remainingGasTo","type":"address"},
                {"name":"callbackTo","type":"address"},
                {"name":"payload","type":"cell"}
            ],
            "outputs": []
        },
        {
            "name": "disableBurnByRoot",
            "inputs": [{"name":"answerId","type":"uint32"}],
            "outputs": [{"name":"value0","type":"bool"}]
        },
        {
            "name": "burnByRootDisabled",
            "inputs": [{"name":"answerId","type":"uint32"}],
            "outputs": [{"name":"value0","type":"bool"}]
        },
        {
            "name": "burnPaused",
            "inputs": [{"name":"answerId","type":"uint32"}],
            "outputs": [{"name":"value0","type":"bool"}]
        },
        {
            "name": "setBurnPaused",
            "inputs": [{"name":"answerId","type":"uint32"},{"name":"paused","type":"bool"}],
            "outputs": [{"name":"value0","type":"bool"}]
        },
        {
            "name": "transferOwnership",
            "inputs": [
                {"name":"newOwner","type":"address"},
                {"name":"remainingGasTo","type":"address"},
                {"components":[{"name":"value","type":"uint128"},{"name":"payload","type":"cell"}],"name":"callbacks","type":"map(address,tuple)"}
            ],
            "outputs": []
        },
        {
            "name": "name",
            "inputs": [{"name":"answerId","type":"uint32"}],
            "outputs": [{"name":"value0","type":"string"}]
        },
        {
            "name": "symbol",
            "inputs": [{"name":"answerId","type":"uint32"}],
            "outputs": [{"name":"value0","type":"string"}]
        },
        {
            "name": "decimals",
            "inputs": [{"name":"answerId","type":"uint32"}],
            "outputs": [{"name":"value0","type":"uint8"}]
        },
        {
            "name": "totalSupply",
            "inputs": [{"name":"answerId","type":"uint32"}],
            "outputs": [{"name":"value0","type":"uint128"}]
        },
        {
            "name": "walletCode",
            "inputs": [{"name":"answerId","type":"uint32"}],
            "outputs": [{"name":"value0","type":"cell"}]
        },
        {
            "name": "rootOwner",
            "inputs": [{"name":"answerId","type":"uint32"}],
            "outputs": [{"name":"value0","type":"address"}]
        },
        {
            "name": "walletOf",
            "inputs": [{"name":"answerId","type":"uint32"},{"name":"walletOwner","type":"address"}],
            "outputs": [{"name":"value0","type":"address"}]
        },
        {
            "name": "deployWallet",
            "inputs": [{"name":"answerId","type":"uint32"},{"name":"walletOwner","type":"address"},{"name":"deployWalletValue","type":"uint128"}],
            "outputs": [{"name":"tokenWallet","type":"address"}]
        },
        {
            "name": "mint",
            "inputs": [
                {"name":"amount","type":"uint128"},
                {"name":"recipient","type":"address"},
                {"name":"deployWalletValue","type":"uint128"},
                {"name":"remainingGasTo","type":"address"},
                {"name":"notify","type":"bool"},
                {"name":"payload","type":"cell"}
            ],
            "outputs": []
        },
        {
            "name": "acceptBurn",
            "id": "0x192B51B1",
            "inputs": [
                {"name":"amount","type":"uint128"},
                {"name":"walletOwner","type":"address"},
                {"name":"remainingGasTo","type":"address"},
                {"name":"callbackTo","type":"address"},
                {"name":"payload","type":"cell"}
            ],
            "outputs": []
        },
        {
            "name": "sendSurplusGas",
            "inputs": [{"name":"to","type":"address"}],
            "outputs": []
        }
    ],
    "data": [
        {"key":1,"name":"name_","type":"string"},
        {"key":2,"name":"symbol_","type":"string"},
        {"key":3,"name":"decimals_","type":"uint8"},
        {"key":4,"name":"rootOwner_","type":"address"},
        {"key":5,"name":"walletCode_","type":"cell"},
        {"key":6,"name":"randomNonce_","type":"uint256"},
        {"key":7,"name":"deployer_","type":"address"}
    ],
    "events": [],
    "fields": [
        {"name":"_pubkey","type":"uint256"},
        {"name":"_timestamp","type":"uint64"},
        {"name":"_constructorFlag","type":"bool"},
        {"name":"name_","type":"string"},
        {"name":"symbol_","type":"string"},
        {"name":"decimals_","type":"uint8"},
        {"name":"rootOwner_","type":"address"},
        {"name":"walletCode_","type":"cell"},
        {"name":"totalSupply_","type":"uint128"},
        {"name":"burnPaused_","type":"bool"},
        {"name":"burnByRootDisabled_","type":"bool"},
        {"name":"mintDisabled_","type":"bool"},
        {"name":"randomNonce_","type":"uint256"},
        {"name":"deployer_","type":"address"}
    ]
};

// TokenWallet ABI (Broxus TIP-3 implementation)
const TokenWalletAbi = {
    "ABI version": 2,
    "version": "2.2",
    "header": ["pubkey", "time", "expire"],
    "functions": [
        {"name": "constructor", "inputs": [], "outputs": []},
        {"name": "supportsInterface", "inputs": [{"name":"answerId","type":"uint32"},{"name":"interfaceID","type":"uint32"}], "outputs": [{"name":"value0","type":"bool"}]},
        {"name": "destroy", "inputs": [{"name":"remainingGasTo","type":"address"}], "outputs": []},
        {"name": "burnByRoot", "inputs": [{"name":"amount","type":"uint128"},{"name":"remainingGasTo","type":"address"},{"name":"callbackTo","type":"address"},{"name":"payload","type":"cell"}], "outputs": []},
        {"name": "burn", "inputs": [{"name":"amount","type":"uint128"},{"name":"remainingGasTo","type":"address"},{"name":"callbackTo","type":"address"},{"name":"payload","type":"cell"}], "outputs": []},
        {"name": "balance", "inputs": [{"name":"answerId","type":"uint32"}], "outputs": [{"name":"value0","type":"uint128"}]},
        {"name": "owner", "inputs": [{"name":"answerId","type":"uint32"}], "outputs": [{"name":"value0","type":"address"}]},
        {"name": "root", "inputs": [{"name":"answerId","type":"uint32"}], "outputs": [{"name":"value0","type":"address"}]},
        {"name": "walletCode", "inputs": [{"name":"answerId","type":"uint32"}], "outputs": [{"name":"value0","type":"cell"}]},
        {"name": "transfer", "inputs": [{"name":"amount","type":"uint128"},{"name":"recipient","type":"address"},{"name":"deployWalletValue","type":"uint128"},{"name":"remainingGasTo","type":"address"},{"name":"notify","type":"bool"},{"name":"payload","type":"cell"}], "outputs": []},
        {"name": "transferToWallet", "inputs": [{"name":"amount","type":"uint128"},{"name":"recipientTokenWallet","type":"address"},{"name":"remainingGasTo","type":"address"},{"name":"notify","type":"bool"},{"name":"payload","type":"cell"}], "outputs": []},
        {"name": "acceptTransfer", "id": "0x67A0B95F", "inputs": [{"name":"amount","type":"uint128"},{"name":"sender","type":"address"},{"name":"remainingGasTo","type":"address"},{"name":"notify","type":"bool"},{"name":"payload","type":"cell"}], "outputs": []},
        {"name": "acceptMint", "id": "0x4384F298", "inputs": [{"name":"amount","type":"uint128"},{"name":"remainingGasTo","type":"address"},{"name":"notify","type":"bool"},{"name":"payload","type":"cell"}], "outputs": []},
        {"name": "sendSurplusGas", "inputs": [{"name":"to","type":"address"}], "outputs": []}
    ],
    "data": [
        {"key":1,"name":"root_","type":"address"},
        {"key":2,"name":"owner_","type":"address"}
    ],
    "events": [],
    "fields": [
        {"name":"_pubkey","type":"uint256"},
        {"name":"_timestamp","type":"uint64"},
        {"name":"_constructorFlag","type":"bool"},
        {"name":"root_","type":"address"},
        {"name":"owner_","type":"address"},
        {"name":"balance_","type":"uint128"}
    ]
};

// TokenRoot TVC (base64 encoded compiled contract)
const TokenRootTvc = "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";

// TokenWallet TVC (base64 encoded compiled contract)
const TokenWalletTvc = "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";

// Zero address constant
const ZERO_ADDRESS = "0:0000000000000000000000000000000000000000000000000000000000000000";

// Explorer URL
const EXPLORER_URL = "https://testnet.tychoprotocol.com";

// ============== Application State ==============

const recentDeployments = [];
let provider = null;
let selectedAddress = null;
let selectedPublicKey = null;
let isWalletConnected = false;

// ============== Initialization ==============

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initForms();
    initLivePreview();
    initDecimalInput();
    initSupplyPresets();
    initWalletConnection();
});

// ============== Wallet Provider Detection ==============

async function hasWalletProvider() {
    if (window.__sparx) return 'sparx';
    if (window.__ever || window.__hasEverscaleProvider === true) return 'ever';

    return new Promise((resolve) => {
        const checkProviders = () => {
            if (window.__sparx) resolve('sparx');
            else if (window.__ever || window.__hasEverscaleProvider === true) resolve('ever');
            else resolve(null);
        };

        if (document.readyState === 'complete') {
            setTimeout(checkProviders, 100);
        } else {
            window.addEventListener('load', () => setTimeout(checkProviders, 100));
        }
    });
}

async function getWalletProvider() {
    if (window.__sparx) {
        return window.__sparx;
    }
    if (window.__ever) {
        return window.__ever;
    }

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Provider initialization timeout - no wallet detected'));
        }, 5000);

        const sparxHandler = () => {
            if (window.__sparx) {
                clearTimeout(timeout);
                resolve(window.__sparx);
            }
        };

        const everHandler = () => {
            if (window.__ever) {
                clearTimeout(timeout);
                resolve(window.__ever);
            }
        };

        window.addEventListener('sparx#initialized', sparxHandler, { once: true });
        window.addEventListener('ever#initialized', everHandler, { once: true });

        if (window.__sparx) {
            clearTimeout(timeout);
            resolve(window.__sparx);
        } else if (window.__ever) {
            clearTimeout(timeout);
            resolve(window.__ever);
        }
    });
}

// ============== Wallet Connection ==============

async function initWalletConnection() {
    const connectBtn = document.getElementById('connect-wallet-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');

    connectBtn.addEventListener('click', connectWallet);
    disconnectBtn.addEventListener('click', disconnectWallet);

    const walletType = await hasWalletProvider();

    if (walletType) {
        try {
            provider = await getWalletProvider();

            let providerState;
            if (typeof provider.getProviderState === 'function') {
                providerState = await provider.getProviderState();
            } else if (typeof provider.request === 'function') {
                providerState = await provider.request({ method: 'getProviderState' });
            }

            if (providerState?.permissions?.accountInteraction) {
                selectedAddress = providerState.permissions.accountInteraction.address;
                selectedPublicKey = providerState.permissions.accountInteraction.publicKey;
                isWalletConnected = true;
                updateWalletUI();
                await refreshWalletBalance();
            }

            try {
                if (typeof provider.subscribe === 'function') {
                    const subscription = await provider.subscribe('permissionsChanged');
                    subscription.on('data', handlePermissionChange);
                }
            } catch (subErr) {
                // Subscription not supported
            }

        } catch (e) {
            // No existing wallet connection
        }
    }
}

function handlePermissionChange(event) {
    if (event.permissions?.accountInteraction) {
        selectedAddress = event.permissions.accountInteraction.address;
        selectedPublicKey = event.permissions.accountInteraction.publicKey;
        isWalletConnected = true;
    } else {
        selectedAddress = null;
        selectedPublicKey = null;
        isWalletConnected = false;
    }
    updateWalletUI();
    refreshWalletBalance();
}

async function connectWallet() {
    const connectBtn = document.getElementById('connect-wallet-btn');
    setButtonLoading(connectBtn, true);

    try {
        const walletType = await hasWalletProvider();
        if (!walletType) {
            showWalletInstallModal();
            setButtonLoading(connectBtn, false);
            return;
        }

        if (!provider) {
            provider = await getWalletProvider();
        }

        let result;
        if (typeof provider.requestPermissions === 'function') {
            result = await provider.requestPermissions({
                permissions: ['basic', 'accountInteraction']
            });
        } else if (typeof provider.request === 'function') {
            result = await provider.request({
                method: 'requestPermissions',
                params: { permissions: ['basic', 'accountInteraction'] }
            });
        } else {
            throw new Error('Provider does not have requestPermissions or request method');
        }

        if (result?.accountInteraction) {
            selectedAddress = result.accountInteraction.address;
            selectedPublicKey = result.accountInteraction.publicKey;
            isWalletConnected = true;
            updateWalletUI();
            await refreshWalletBalance();
            showNotification('Wallet connected successfully', 'success');
        } else {
            throw new Error('Wallet did not return account interaction permission');
        }
    } catch (error) {
        if (error.code === 4001 || error.message?.includes('denied') || error.message?.includes('reject') || error.message?.includes('cancelled')) {
            showNotification('Connection cancelled by user', 'warning');
        } else {
            showNotification('Failed to connect: ' + (error.message || 'Unknown error'), 'error');
        }
    } finally {
        setButtonLoading(connectBtn, false);
    }
}

async function disconnectWallet() {
    try {
        if (provider?.disconnect) {
            await provider.disconnect();
        }
        selectedAddress = null;
        selectedPublicKey = null;
        isWalletConnected = false;
        updateWalletUI();
        showNotification('Wallet disconnected', 'success');
    } catch (error) {
        // Disconnect failed silently
    }
}

function updateWalletUI() {
    const connectBtn = document.getElementById('connect-wallet-btn');
    const walletStatus = document.getElementById('wallet-status');
    const addressEl = document.getElementById('header-address');
    const deployNotice = document.getElementById('wallet-required-notice');
    const mintNotice = document.getElementById('mint-wallet-notice');
    const deployBtn = document.getElementById('deploy-btn');
    const mintBtn = document.getElementById('mint-btn');

    if (isWalletConnected && selectedAddress) {
        connectBtn.style.display = 'none';
        walletStatus.style.display = 'flex';

        const addrStr = typeof selectedAddress === 'string' ? selectedAddress : selectedAddress.toString();
        addressEl.textContent = truncateAddress(addrStr);
        addressEl.title = addrStr;

        deployBtn.disabled = false;
        mintBtn.disabled = false;

        deployNotice.classList.add('hidden');
        mintNotice.classList.add('hidden');

        addressEl.onclick = () => {
            navigator.clipboard.writeText(addrStr);
            showNotification('Address copied to clipboard', 'success');
        };
    } else {
        connectBtn.style.display = 'inline-flex';
        walletStatus.style.display = 'none';

        deployBtn.disabled = true;
        mintBtn.disabled = true;

        deployNotice.classList.remove('hidden');
        mintNotice.classList.remove('hidden');
    }
}

async function refreshWalletBalance() {
    if (!isWalletConnected || !selectedAddress || !provider) {
        document.getElementById('header-balance').textContent = '0.00 TYCHO';
        return;
    }

    try {
        const addrStr = typeof selectedAddress === 'string' ? selectedAddress : selectedAddress.toString();
        let balance = null;

        try {
            let state;
            if (typeof provider.getFullContractState === 'function') {
                state = await provider.getFullContractState({ address: addrStr });
            } else if (typeof provider.request === 'function') {
                state = await provider.request({
                    method: 'getFullContractState',
                    params: { address: addrStr }
                });
            }
            if (state?.state?.balance) {
                balance = state.state.balance;
            }
        } catch (e) {
            // Balance fetch failed
        }

        if (balance) {
            const balanceNum = parseInt(balance) / 1_000_000_000;
            document.getElementById('header-balance').textContent = `${balanceNum.toFixed(2)} TYCHO`;
        } else {
            document.getElementById('header-balance').textContent = 'Connected';
        }
    } catch (error) {
        document.getElementById('header-balance').textContent = 'Connected';
    }
}

function showWalletInstallModal() {
    let modal = document.getElementById('wallet-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'wallet-modal';
        modal.className = 'wallet-modal';
        modal.innerHTML = `
            <div class="wallet-modal-content">
                <h3>Wallet Required</h3>
                <p>To deploy tokens on Tycho network, you need to install the Sparx wallet extension or EVER Wallet.</p>
                <div class="wallet-modal-actions">
                    <a href="https://sparxwallet.com" target="_blank" class="btn btn-primary">Get Sparx Wallet</a>
                    <button class="btn btn-secondary" onclick="closeWalletModal()">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
}

function closeWalletModal() {
    const modal = document.getElementById('wallet-modal');
    if (modal) modal.classList.add('hidden');
}

// ============== Token Deployment (Pure Frontend) ==============

async function handleDeploy(e) {
    e.preventDefault();

    if (!isWalletConnected || !selectedAddress || !provider) {
        showNotification('Please connect your wallet first', 'warning');
        return;
    }

    const btn = document.getElementById('deploy-btn');
    const resultDiv = document.getElementById('deploy-result');

    setButtonLoading(btn, true);
    resultDiv.style.display = 'none';

    const name = document.getElementById('token-name').value;
    const symbol = document.getElementById('token-symbol').value.toUpperCase();
    const decimalsValue = document.getElementById('token-decimals').value;
    const decimals = parseInt(decimalsValue) || 9;

    // Validate decimals
    if (isNaN(decimals) || decimals < 3 || decimals > 99) {
        showNotification('Decimals must be a number between 3 and 99', 'error');
        validateDecimals(decimalsValue);
        setButtonLoading(btn, false);
        return;
    }

    const supplyRaw = document.getElementById('initial-supply').value.replace(/,/g, '') || '0';
    const rawSupply = BigInt(supplyRaw) * BigInt(10 ** decimals);
    const mintDisabled = !document.getElementById('mintable').checked;
    const burnByRootDisabled = !document.getElementById('burnable').checked;
    const burnPaused = document.getElementById('burn-paused').checked;

    const addrStr = typeof selectedAddress === 'string' ? selectedAddress : selectedAddress.toString();
    const initialSupplyTo = document.getElementById('initial-supply-to').value.trim() || addrStr;

    try {
        showNotification('Preparing token deployment...', 'warning');

        // Generate a random nonce for unique contract address
        const randomNonce = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0')).join('');

        // Extract wallet code from TVC (needed for walletCode_ cell field)
        let walletCode;
        try {
            const walletSplitResult = await provider.request({
                method: 'splitTvc',
                params: { tvc: TokenWalletTvc }
            });
            walletCode = walletSplitResult?.code;
        } catch (splitErr) {
            walletCode = TokenWalletTvc;
        }

        const deployParams = {
            tvc: TokenRootTvc,
            workchain: 0,
            publicKey: selectedPublicKey,
            initParams: {
                name_: name,
                symbol_: symbol,
                decimals_: decimals,
                rootOwner_: addrStr,
                walletCode_: walletCode,  // Use extracted code, not full TVC
                randomNonce_: randomNonce,
                deployer_: ZERO_ADDRESS
            }
        };

        // Get expected address using provider
        let expectedAddress;
        let expectedStateInit = null;
        try {
            let result;
            if (typeof provider.getExpectedAddress === 'function') {
                result = await provider.getExpectedAddress(TokenRootAbi, deployParams);
            } else {
                result = await provider.request({
                    method: 'getExpectedAddress',
                    params: {
                        abi: JSON.stringify(TokenRootAbi),
                        ...deployParams
                    }
                });
            }

            // Check if result includes stateInit
            if (typeof result === 'object') {
                expectedAddress = result.address || result;
                expectedStateInit = result.stateInit || null;
            } else {
                expectedAddress = result;
            }
        } catch (addrErr) {
            throw new Error('Failed to compute contract address: ' + addrErr.message);
        }

        const contractAddress = typeof expectedAddress === 'string' ? expectedAddress :
                               (expectedAddress?.address || expectedAddress?.toString());

        // Constructor parameters
        const constructorParams = {
            initialSupplyTo: rawSupply > 0n ? initialSupplyTo : ZERO_ADDRESS,
            initialSupply: rawSupply.toString(),
            deployWalletValue: '100000000', // 0.1 TYCHO for wallet deployment
            mintDisabled: mintDisabled,
            burnByRootDisabled: burnByRootDisabled,
            burnPaused: burnPaused,
            remainingGasTo: addrStr
        };

        // Get stateInit with properly encoded init data
        let stateInit;

        // Use stateInit from getExpectedAddress if available
        if (expectedStateInit) {
            stateInit = expectedStateInit;
        }

        // Try getStateInit (Broxus standard)
        if (!stateInit) {
            try {
                let stateInitResult;
                if (typeof provider.getStateInit === 'function') {
                    stateInitResult = await provider.getStateInit(TokenRootAbi, deployParams);
                } else {
                    stateInitResult = await provider.request({
                        method: 'getStateInit',
                        params: {
                            abi: JSON.stringify(TokenRootAbi),
                            ...deployParams
                        }
                    });
                }
                stateInit = stateInitResult?.stateInit || stateInitResult;
            } catch (err1) {
                // Will fall through to packIntoCell method below
            }
        }

        // Build stateInit using packIntoCell if getStateInit failed
        if (!stateInit) {
            try {
                // Split TokenRoot TVC to get code
                const splitResult = await provider.request({
                    method: 'splitTvc',
                    params: { tvc: TokenRootTvc }
                });
                const code = splitResult?.code;

                if (!code) {
                    throw new Error('Failed to extract code from TVC');
                }

                if (!walletCode) {
                    throw new Error('Wallet code not available');
                }

                // Pack init data
                const packedData = await provider.request({
                    method: 'packIntoCell',
                    params: {
                        abiVersion: '2.2',
                        structure: [
                            { name: '_pubkey', type: 'uint256' },
                            { name: '_timestamp', type: 'uint64' },
                            { name: '_constructorFlag', type: 'bool' },
                            ...TokenRootAbi.data.map(d => ({ name: d.name, type: d.type }))
                        ],
                        data: {
                            _pubkey: '0x' + selectedPublicKey,
                            _timestamp: '0',
                            _constructorFlag: false,
                            name_: name,
                            symbol_: symbol,
                            decimals_: decimals,
                            rootOwner_: addrStr,
                            walletCode_: walletCode,
                            randomNonce_: randomNonce,
                            deployer_: ZERO_ADDRESS
                        }
                    }
                });

                const mergeResult = await provider.request({
                    method: 'mergeTvc',
                    params: {
                        code: code,
                        data: packedData?.boc || packedData
                    }
                });
                stateInit = mergeResult?.tvc || mergeResult;

            } catch (err2) {
                // Fallback to raw TVC
                stateInit = TokenRootTvc;
            }
        }

        // Deploy contract (two-step: fund with stateInit, then call constructor)
        let deployResult;

        showNotification('Please approve the deployment transaction...', 'warning');

        try {
            // Send funds with stateInit to deploy the contract
            await provider.request({
                method: 'sendMessage',
                params: {
                    sender: addrStr,
                    recipient: contractAddress,
                    amount: '3000000000', // 3 TYCHO
                    bounce: false,
                    stateInit: stateInit
                }
            });

            // Wait for the contract to be deployed
            showNotification('Contract deployed, calling constructor...', 'warning');
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Call constructor via external message
            deployResult = await provider.request({
                method: 'sendExternalMessage',
                params: {
                    publicKey: selectedPublicKey,
                    recipient: contractAddress,
                    stateInit: stateInit,
                    payload: {
                        abi: JSON.stringify(TokenRootAbi),
                        method: 'constructor',
                        params: constructorParams
                    }
                }
            });

        } catch (deployErr) {
            throw new Error('Failed to deploy: ' + deployErr.message);
        }

        // Extract transaction ID
        let txId;
        if (deployResult?.transaction?.id?.hash) {
            txId = deployResult.transaction.id.hash;
        } else if (typeof deployResult?.transaction?.id === 'string') {
            txId = deployResult.transaction.id;
        } else if (deployResult?.transaction?.hash) {
            txId = deployResult.transaction.hash;
        } else if (deployResult?.hash) {
            txId = deployResult.hash;
        } else if (deployResult?.messageHash) {
            txId = deployResult.messageHash;
        } else {
            txId = 'pending';
        }

        const data = {
            success: true,
            address: contractAddress,
            name: name,
            symbol: symbol,
            decimals: decimals,
            initial_supply: rawSupply.toString(),
            owner: addrStr,
            transaction_id: txId,
            explorer_url: `${EXPLORER_URL}/accounts/${contractAddress}`
        };

        showDeployResult(resultDiv, data, true);
        addRecentDeployment(data);
        await refreshWalletBalance();
        resetForm();
        showNotification('Token deployed successfully!', 'success');

    } catch (error) {
        if (error.code === 4001 || error.message?.includes('reject') || error.message?.includes('cancel') || error.message?.includes('denied')) {
            showNotification('Transaction cancelled by user', 'warning');
            setButtonLoading(btn, false);
            return;
        }

        showDeployResult(resultDiv, { error: error.message || 'Unknown error occurred' }, false);
    } finally {
        setButtonLoading(btn, false);
    }
}

// ============== Mint Tokens ==============

async function handleMint(e) {
    e.preventDefault();

    if (!isWalletConnected || !selectedAddress || !provider) {
        showNotification('Please connect your wallet first', 'warning');
        return;
    }

    const btn = document.getElementById('mint-btn');
    const resultDiv = document.getElementById('mint-result');

    setButtonLoading(btn, true);
    resultDiv.style.display = 'none';

    const tokenAddress = document.getElementById('mint-token-address').value.trim();
    const amount = document.getElementById('mint-amount').value.replace(/,/g, '');
    const recipient = document.getElementById('mint-recipient').value.trim();
    const notify = document.getElementById('mint-notify').checked;

    const addrStr = typeof selectedAddress === 'string' ? selectedAddress : selectedAddress.toString();

    try {
        // Call mint function on token root
        const mintParams = {
            amount: amount,
            recipient: recipient || addrStr,
            deployWalletValue: '100000000', // 0.1 TYCHO
            remainingGasTo: addrStr,
            notify: notify,
            payload: '' // Empty cell
        };

        showNotification('Please approve the mint transaction...', 'warning');

        const result = await provider.request({
            method: 'sendMessage',
            params: {
                sender: addrStr,
                recipient: tokenAddress,
                amount: '500000000', // 0.5 TYCHO for gas
                bounce: true,
                payload: {
                    abi: JSON.stringify(TokenRootAbi),
                    method: 'mint',
                    params: mintParams
                }
            }
        });

        let txId = result?.transaction?.id?.hash || result?.hash || 'pending';

        showMintResult(resultDiv, {
            transaction_id: txId,
            message: 'Tokens minted successfully'
        }, true);

        await refreshWalletBalance();
        showNotification('Tokens minted successfully!', 'success');

    } catch (error) {
        if (error.code === 4001 || error.message?.includes('reject') || error.message?.includes('cancel')) {
            showNotification('Transaction cancelled by user', 'warning');
            setButtonLoading(btn, false);
            return;
        }

        showMintResult(resultDiv, { error: error.message || 'Mint failed' }, false);
    } finally {
        setButtonLoading(btn, false);
    }
}

// ============== UI Helper Functions ==============

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) notification.remove();
    }, 5000);
}

function initTabs() {
    const tabs = document.querySelectorAll('.main-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));

            tab.classList.add('active');
            const tabId = tab.dataset.tab;
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

function initForms() {
    const deployForm = document.getElementById('deploy-form');
    if (deployForm) {
        deployForm.addEventListener('submit', handleDeploy);
    }
    const mintForm = document.getElementById('mint-form');
    if (mintForm) {
        mintForm.addEventListener('submit', handleMint);
    }
}

function initLivePreview() {
    const nameInput = document.getElementById('token-name');
    const symbolInput = document.getElementById('token-symbol');
    const decimalsInput = document.getElementById('token-decimals');
    const supplyInput = document.getElementById('initial-supply');
    const mintableCheck = document.getElementById('mintable');
    const burnableCheck = document.getElementById('burnable');

    nameInput.addEventListener('input', () => {
        const name = nameInput.value || 'Token Name';
        document.getElementById('preview-name').textContent = name;
        document.getElementById('avatar-letter').textContent = name.charAt(0).toUpperCase() || 'T';
        document.getElementById('name-count').textContent = nameInput.value.length;
    });

    symbolInput.addEventListener('input', () => {
        const symbol = symbolInput.value.toUpperCase() || 'SYMBOL';
        document.getElementById('preview-symbol').textContent = symbol;
        document.getElementById('supply-symbol-display').textContent = symbol || 'tokens';
        document.getElementById('symbol-count').textContent = symbolInput.value.length;
    });

    decimalsInput.addEventListener('input', () => {
        document.getElementById('preview-decimals').textContent = decimalsInput.value;
        updateRawSupply();
    });

    supplyInput.addEventListener('input', () => {
        updateSupplyPreview();
        updateRawSupply();
    });

    mintableCheck.addEventListener('change', updateFeaturePreview);
    burnableCheck.addEventListener('change', updateFeaturePreview);
}

function updateSupplyPreview() {
    const supply = document.getElementById('initial-supply').value.replace(/,/g, '') || '0';
    const formatted = parseInt(supply).toLocaleString();
    document.getElementById('preview-supply').textContent = formatted;
}

function updateRawSupply() {
    const supply = document.getElementById('initial-supply').value.replace(/,/g, '') || '0';
    const decimals = parseInt(document.getElementById('token-decimals').value) || 9;
    const raw = BigInt(supply) * BigInt(10 ** decimals);
    document.getElementById('raw-supply-display').textContent = raw.toLocaleString();
}

function updateFeaturePreview() {
    const mintable = document.getElementById('mintable').checked;
    const burnable = document.getElementById('burnable').checked;

    const mintBadge = document.querySelector('.feature-badge[data-feature="mint"]');
    const burnBadge = document.querySelector('.feature-badge[data-feature="burn"]');

    if (mintBadge) mintBadge.classList.toggle('active', mintable);
    if (burnBadge) burnBadge.classList.toggle('active', burnable);

    const checkMintable = document.getElementById('check-mintable');
    if (checkMintable) checkMintable.style.opacity = mintable ? '1' : '0.4';
}

function initDecimalInput() {
    const input = document.getElementById('token-decimals');

    input.addEventListener('input', () => {
        // Allow only numbers
        input.value = input.value.replace(/[^0-9]/g, '');

        validateDecimals(input.value);
        document.getElementById('preview-decimals').textContent = input.value || '0';
        updateRawSupply();
    });
}

function validateDecimals(value) {
    const num = parseInt(value);
    const errorHint = document.getElementById('decimals-error');
    const normalHint = document.getElementById('decimals-hint');
    const input = document.getElementById('token-decimals');
    const deployBtn = document.getElementById('deploy-btn');

    const isValid = !isNaN(num) && num >= 3 && num <= 99;

    if (isValid) {
        errorHint.style.display = 'none';
        normalHint.style.display = 'block';
        input.classList.remove('input-error');
        if (isWalletConnected) {
            deployBtn.disabled = false;
        }
    } else {
        errorHint.style.display = 'block';
        normalHint.style.display = 'none';
        input.classList.add('input-error');
        deployBtn.disabled = true;
    }

    return isValid;
}

function initSupplyPresets() {
    const presets = document.querySelectorAll('.preset-btn');
    const input = document.getElementById('initial-supply');

    presets.forEach(btn => {
        btn.addEventListener('click', () => {
            input.value = parseInt(btn.dataset.value).toLocaleString();
            updateSupplyPreview();
            updateRawSupply();
        });
    });
}

function resetForm() {
    document.getElementById('deploy-form').reset();
    document.getElementById('token-decimals').value = 3;
    document.getElementById('initial-supply').value = '1000000';

    document.getElementById('preview-name').textContent = 'Token Name';
    document.getElementById('preview-symbol').textContent = 'SYMBOL';
    document.getElementById('preview-supply').textContent = '1,000,000';
    document.getElementById('preview-decimals').textContent = '3';
    document.getElementById('avatar-letter').textContent = 'T';
    document.getElementById('name-count').textContent = '0';
    document.getElementById('symbol-count').textContent = '0';

    // Reset decimals validation state
    document.getElementById('decimals-error').style.display = 'none';
    document.getElementById('decimals-hint').style.display = 'block';
    document.getElementById('token-decimals').classList.remove('input-error');

    document.getElementById('mintable').checked = true;
    document.getElementById('burnable').checked = true;
    document.getElementById('burn-paused').checked = false;
    updateFeaturePreview();
    updateRawSupply();
}

// ============== Result Display Functions ==============

function showDeployResult(div, data, success) {
    div.style.display = 'block';
    div.className = `result-card ${success ? 'success' : 'error'}`;

    if (success) {
        div.innerHTML = `
            <h3>Token Deployed Successfully</h3>
            <div class="result-details">
                <div class="result-row">
                    <span class="result-label">Contract Address</span>
                    <span class="result-value">${truncateAddress(data.address)}</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Token</span>
                    <span class="result-value">${data.name} (${data.symbol})</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Initial Supply</span>
                    <span class="result-value">${formatSupply(data.initial_supply, data.decimals)}</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Transaction</span>
                    <span class="result-value">${truncateAddress(data.transaction_id)}</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Explorer</span>
                    <span class="result-value"><a href="${data.explorer_url}" target="_blank">View on Explorer</a></span>
                </div>
            </div>
        `;
    } else {
        div.innerHTML = `
            <h3>Deployment Failed</h3>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">${data.error}</p>
        `;
    }
}

function showMintResult(div, data, success) {
    div.style.display = 'block';
    div.className = `result-card ${success ? 'success' : 'error'}`;

    if (success) {
        div.innerHTML = `
            <h3>Tokens Minted Successfully</h3>
            <div class="result-details">
                <div class="result-row">
                    <span class="result-label">Transaction</span>
                    <span class="result-value">${truncateAddress(data.transaction_id)}</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Status</span>
                    <span class="result-value">${data.message}</span>
                </div>
            </div>
        `;
    } else {
        div.innerHTML = `
            <h3>Mint Failed</h3>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">${data.error}</p>
        `;
    }
}

// ============== Recent Deployments ==============

function addRecentDeployment(data) {
    recentDeployments.unshift(data);
    updateRecentDeployments();
}

function updateRecentDeployments() {
    const container = document.getElementById('recent-deployments');
    const countEl = document.getElementById('recent-count');

    countEl.textContent = recentDeployments.length;

    if (recentDeployments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">◇</span>
                <p>No tokens deployed yet in this session</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recentDeployments.map(d => `
        <div class="deployment-item">
            <div class="deployment-info">
                <div class="deployment-avatar">${d.name.charAt(0).toUpperCase()}</div>
                <div class="deployment-details">
                    <h4>${d.name} (${d.symbol})</h4>
                    <span class="deployment-address">${truncateAddress(d.address)}</span>
                </div>
            </div>
            <div class="deployment-actions">
                <a href="${d.explorer_url}" target="_blank">View</a>
            </div>
        </div>
    `).join('');
}

// ============== Utility Functions ==============

function setButtonLoading(btn, loading) {
    if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
        const isActionButton = btn.id === 'deploy-btn' || btn.id === 'mint-btn';
        if (isActionButton) {
            btn.disabled = !isWalletConnected;
        } else {
            btn.disabled = false;
        }
    }
}

function truncateAddress(address) {
    let addrStr = address;
    if (address && typeof address === 'object') {
        addrStr = address.toString?.() || address.address || address._address || JSON.stringify(address);
    }
    if (!addrStr || typeof addrStr !== 'string' || addrStr.length < 20) return addrStr || 'N/A';
    return `${addrStr.slice(0, 10)}...${addrStr.slice(-8)}`;
}

function formatSupply(supply, decimals) {
    try {
        const num = BigInt(supply);
        const divisor = BigInt(10 ** decimals);
        const whole = num / divisor;
        const fraction = num % divisor;

        if (fraction === 0n) {
            return Number(whole).toLocaleString();
        }

        const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
        return `${Number(whole).toLocaleString()}.${fractionStr}`;
    } catch {
        return supply.toString();
    }
}
