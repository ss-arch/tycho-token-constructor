// Tycho Token Constructor - Frontend Application with Sparx Wallet Integration

const API_BASE = '';
const recentDeployments = [];

// Wallet state
let provider = null;
let selectedAddress = null;
let selectedPublicKey = null;
let isWalletConnected = false;

// TIP-3 Token Root ABI (minimal for deployment)
const TokenRootAbi = {
    "ABI version": 2,
    "version": "2.2",
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
            "name": "name",
            "inputs": [],
            "outputs": [{"name": "value0", "type": "string"}]
        },
        {
            "name": "symbol",
            "inputs": [],
            "outputs": [{"name": "value0", "type": "string"}]
        },
        {
            "name": "decimals",
            "inputs": [],
            "outputs": [{"name": "value0", "type": "uint8"}]
        },
        {
            "name": "totalSupply",
            "inputs": [],
            "outputs": [{"name": "value0", "type": "uint128"}]
        },
        {
            "name": "rootOwner",
            "inputs": [],
            "outputs": [{"name": "value0", "type": "address"}]
        }
    ],
    "events": [],
    "data": [
        {"key": 1, "name": "name_", "type": "string"},
        {"key": 2, "name": "symbol_", "type": "string"},
        {"key": 3, "name": "decimals_", "type": "uint8"},
        {"key": 4, "name": "rootOwner_", "type": "address"},
        {"key": 5, "name": "walletCode_", "type": "cell"},
        {"key": 6, "name": "randomNonce_", "type": "uint256"},
        {"key": 7, "name": "deployer_", "type": "address"}
    ],
    "fields": []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initForms();
    initLivePreview();
    initDecimalButtons();
    initSupplyPresets();
    initWalletConnection();
});

// Initialize wallet connection
async function initWalletConnection() {
    const connectBtn = document.getElementById('connect-wallet-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');

    connectBtn.addEventListener('click', connectWallet);
    disconnectBtn.addEventListener('click', disconnectWallet);

    // Check if provider is available
    if (typeof everscaleProvider !== 'undefined') {
        provider = new everscaleProvider.ProviderRpcClient();

        // Check for existing permissions
        try {
            const providerState = await provider.getProviderState();
            if (providerState.permissions.accountInteraction) {
                // Already connected
                selectedAddress = providerState.permissions.accountInteraction.address;
                selectedPublicKey = providerState.permissions.accountInteraction.publicKey;
                isWalletConnected = true;
                updateWalletUI();
                await refreshWalletBalance();
            }
        } catch (e) {
            console.log('No existing wallet connection');
        }

        // Subscribe to permission changes
        provider.subscribe('permissionsChanged').then(subscription => {
            subscription.on('data', (event) => {
                if (event.permissions.accountInteraction) {
                    selectedAddress = event.permissions.accountInteraction.address;
                    selectedPublicKey = event.permissions.accountInteraction.publicKey;
                    isWalletConnected = true;
                } else {
                    selectedAddress = null;
                    selectedPublicKey = null;
                    isWalletConnected = false;
                }
                updateWalletUI();
            });
        });
    }
}

// Connect wallet
async function connectWallet() {
    const connectBtn = document.getElementById('connect-wallet-btn');
    setButtonLoading(connectBtn, true);

    try {
        // Check if provider exists
        if (typeof everscaleProvider === 'undefined') {
            showWalletInstallModal();
            return;
        }

        if (!provider) {
            provider = new everscaleProvider.ProviderRpcClient();
        }

        // Check if extension is installed
        const hasProvider = await provider.hasProvider();
        if (!hasProvider) {
            showWalletInstallModal();
            return;
        }

        // Request permissions
        const permissions = await provider.requestPermissions({
            permissions: ['basic', 'accountInteraction']
        });

        if (permissions.accountInteraction) {
            selectedAddress = permissions.accountInteraction.address;
            selectedPublicKey = permissions.accountInteraction.publicKey;
            isWalletConnected = true;
            updateWalletUI();
            await refreshWalletBalance();
        } else {
            throw new Error('User denied wallet connection');
        }
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        if (error.code === 4001 || error.message?.includes('denied')) {
            showNotification('Connection cancelled by user', 'warning');
        } else {
            showNotification('Failed to connect wallet: ' + error.message, 'error');
        }
    } finally {
        setButtonLoading(connectBtn, false);
    }
}

// Disconnect wallet
async function disconnectWallet() {
    try {
        if (provider) {
            await provider.disconnect();
        }
        selectedAddress = null;
        selectedPublicKey = null;
        isWalletConnected = false;
        updateWalletUI();
    } catch (error) {
        console.error('Failed to disconnect:', error);
    }
}

// Update wallet UI
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
        addressEl.textContent = truncateAddress(selectedAddress.toString());
        addressEl.title = selectedAddress.toString();

        // Enable action buttons
        deployBtn.disabled = false;
        mintBtn.disabled = false;
        deployNotice.classList.add('hidden');
        mintNotice.classList.add('hidden');

        // Copy address on click
        addressEl.onclick = () => {
            navigator.clipboard.writeText(selectedAddress.toString());
            showNotification('Address copied to clipboard', 'success');
        };
    } else {
        connectBtn.style.display = 'inline-flex';
        walletStatus.style.display = 'none';

        // Disable action buttons
        deployBtn.disabled = true;
        mintBtn.disabled = true;
        deployNotice.classList.remove('hidden');
        mintNotice.classList.remove('hidden');
    }
}

// Refresh wallet balance
async function refreshWalletBalance() {
    if (!isWalletConnected || !selectedAddress || !provider) {
        document.getElementById('header-balance').textContent = '0.00 TYCHO';
        return;
    }

    try {
        const balance = await provider.getBalance(selectedAddress);
        const balanceNum = parseInt(balance) / 1_000_000_000;
        document.getElementById('header-balance').textContent = `${balanceNum.toFixed(2)} TYCHO`;
    } catch (error) {
        console.error('Failed to get balance:', error);
        document.getElementById('header-balance').textContent = 'Error';
    }
}

// Show wallet install modal
function showWalletInstallModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('wallet-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'wallet-modal';
        modal.className = 'wallet-modal';
        modal.innerHTML = `
            <div class="wallet-modal-content">
                <h3>Wallet Required</h3>
                <p>To deploy tokens on Tycho network, you need to install the Sparx wallet extension or use the EVER Wallet.</p>
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
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => notification.remove(), 5000);
}

// Tab functionality
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

// Form handlers
function initForms() {
    document.getElementById('deploy-form').addEventListener('submit', handleDeploy);
    document.getElementById('info-form').addEventListener('submit', handleGetInfo);
    document.getElementById('mint-form').addEventListener('submit', handleMint);
}

// Live preview functionality
function initLivePreview() {
    const nameInput = document.getElementById('token-name');
    const symbolInput = document.getElementById('token-symbol');
    const decimalsInput = document.getElementById('token-decimals');
    const supplyInput = document.getElementById('initial-supply');
    const mintableCheck = document.getElementById('mintable');
    const burnableCheck = document.getElementById('burnable');

    // Name updates
    nameInput.addEventListener('input', () => {
        const name = nameInput.value || 'Token Name';
        document.getElementById('preview-name').textContent = name;
        document.getElementById('avatar-letter').textContent = name.charAt(0).toUpperCase() || 'T';
        document.getElementById('name-count').textContent = nameInput.value.length;
    });

    // Symbol updates
    symbolInput.addEventListener('input', () => {
        const symbol = symbolInput.value.toUpperCase() || 'SYMBOL';
        document.getElementById('preview-symbol').textContent = symbol;
        document.getElementById('supply-symbol-display').textContent = symbol || 'tokens';
        document.getElementById('symbol-count').textContent = symbolInput.value.length;
    });

    // Decimals updates
    decimalsInput.addEventListener('input', () => {
        document.getElementById('preview-decimals').textContent = decimalsInput.value;
        updateRawSupply();
    });

    // Supply updates
    supplyInput.addEventListener('input', () => {
        updateSupplyPreview();
        updateRawSupply();
    });

    // Feature toggles
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

    if (mintBadge) {
        mintBadge.classList.toggle('active', mintable);
    }
    if (burnBadge) {
        burnBadge.classList.toggle('active', burnable);
    }

    // Update checklist
    const checkMintable = document.getElementById('check-mintable');
    if (checkMintable) {
        checkMintable.style.opacity = mintable ? '1' : '0.4';
    }
}

// Decimal buttons
function initDecimalButtons() {
    const buttons = document.querySelectorAll('.decimal-btn');
    const input = document.getElementById('token-decimals');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            input.value = btn.dataset.value;
            document.getElementById('preview-decimals').textContent = btn.dataset.value;
            updateRawSupply();
        });
    });

    input.addEventListener('input', () => {
        buttons.forEach(b => b.classList.remove('active'));
        const matchingBtn = Array.from(buttons).find(b => b.dataset.value === input.value);
        if (matchingBtn) matchingBtn.classList.add('active');
    });
}

// Supply presets
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

// Deploy token handler - uses connected wallet
async function handleDeploy(e) {
    e.preventDefault();

    if (!isWalletConnected || !selectedAddress) {
        showNotification('Please connect your wallet first', 'warning');
        return;
    }

    const btn = document.getElementById('deploy-btn');
    const resultDiv = document.getElementById('deploy-result');

    setButtonLoading(btn, true);
    resultDiv.style.display = 'none';

    const name = document.getElementById('token-name').value;
    const symbol = document.getElementById('token-symbol').value.toUpperCase();
    const decimals = parseInt(document.getElementById('token-decimals').value) || 9;
    const supplyRaw = document.getElementById('initial-supply').value.replace(/,/g, '') || '0';
    const rawSupply = BigInt(supplyRaw) * BigInt(10 ** decimals);
    const mintDisabled = !document.getElementById('mintable').checked;
    const burnByRootDisabled = !document.getElementById('burnable').checked;
    const burnPaused = document.getElementById('burn-paused').checked;

    const initialSupplyTo = document.getElementById('initial-supply-to').value.trim() || selectedAddress.toString();

    try {
        // Deploy via backend API which handles the contract deployment
        // The backend will request signature from the connected wallet
        const payload = {
            name: name,
            symbol: symbol,
            decimals: decimals,
            initial_supply: Number(rawSupply),
            initial_supply_to: initialSupplyTo,
            mint_disabled: mintDisabled,
            burn_by_root_disabled: burnByRootDisabled,
            burn_paused: burnPaused,
            owner_address: selectedAddress.toString(),
            owner_public_key: selectedPublicKey
        };

        const response = await fetch(`${API_BASE}/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showDeployResult(resultDiv, data, true);
            addRecentDeployment(data);
            await refreshWalletBalance();
            resetForm();
        } else {
            showDeployResult(resultDiv, { error: data.detail || 'Deployment failed' }, false);
        }
    } catch (error) {
        showDeployResult(resultDiv, { error: error.message }, false);
    } finally {
        setButtonLoading(btn, false);
    }
}

function resetForm() {
    document.getElementById('deploy-form').reset();
    document.getElementById('token-decimals').value = 9;
    document.getElementById('initial-supply').value = '1000000';

    // Reset preview
    document.getElementById('preview-name').textContent = 'Token Name';
    document.getElementById('preview-symbol').textContent = 'SYMBOL';
    document.getElementById('preview-supply').textContent = '1,000,000';
    document.getElementById('preview-decimals').textContent = '9';
    document.getElementById('avatar-letter').textContent = 'T';
    document.getElementById('name-count').textContent = '0';
    document.getElementById('symbol-count').textContent = '0';

    // Reset decimal buttons
    document.querySelectorAll('.decimal-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.decimal-btn[data-value="9"]').classList.add('active');

    // Reset features
    document.getElementById('mintable').checked = true;
    document.getElementById('burnable').checked = true;
    document.getElementById('burn-paused').checked = false;
    updateFeaturePreview();
    updateRawSupply();
}

// Get token info handler
async function handleGetInfo(e) {
    e.preventDefault();

    const btn = document.getElementById('info-btn');
    const resultDiv = document.getElementById('info-result');
    const address = document.getElementById('info-address').value.trim();

    setButtonLoading(btn, true);
    resultDiv.style.display = 'none';

    try {
        // Try to get info via provider if connected
        if (isWalletConnected && provider) {
            try {
                const contract = new provider.Contract(TokenRootAbi, new everscaleProvider.Address(address));

                const [nameRes, symbolRes, decimalsRes, totalSupplyRes, rootOwnerRes] = await Promise.all([
                    contract.methods.name({}).call(),
                    contract.methods.symbol({}).call(),
                    contract.methods.decimals({}).call(),
                    contract.methods.totalSupply({}).call(),
                    contract.methods.rootOwner({}).call()
                ]);

                const data = {
                    address: address,
                    name: nameRes.value0,
                    symbol: symbolRes.value0,
                    decimals: parseInt(decimalsRes.value0),
                    total_supply: totalSupplyRes.value0,
                    root_owner: rootOwnerRes.value0.toString(),
                    explorer_url: `https://tychoprotocol.com/explorer/accounts/${address}`
                };

                showInfoResult(resultDiv, data, true);
                return;
            } catch (e) {
                console.log('Failed to get info via provider, falling back to API:', e);
            }
        }

        // Fallback to API
        const response = await fetch(`${API_BASE}/tokens/${encodeURIComponent(address)}`);
        const data = await response.json();

        if (response.ok) {
            showInfoResult(resultDiv, data, true);
        } else {
            showInfoResult(resultDiv, { error: data.detail || 'Token not found' }, false);
        }
    } catch (error) {
        showInfoResult(resultDiv, { error: error.message }, false);
    } finally {
        setButtonLoading(btn, false);
    }
}

// Mint tokens handler
async function handleMint(e) {
    e.preventDefault();

    if (!isWalletConnected || !selectedAddress) {
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

    try {
        // Call mint via connected wallet
        if (provider) {
            const contract = new provider.Contract(TokenRootAbi, new everscaleProvider.Address(tokenAddress));

            const transaction = await contract.methods.mint({
                amount: amount,
                recipient: new everscaleProvider.Address(recipient),
                deployWalletValue: '100000000', // 0.1 TYCHO for wallet deployment
                remainingGasTo: selectedAddress,
                notify: notify,
                payload: ''
            }).send({
                from: selectedAddress,
                amount: '500000000', // 0.5 TYCHO for gas
                bounce: true
            });

            showMintResult(resultDiv, {
                transaction_id: transaction.id.hash,
                message: 'Tokens minted successfully'
            }, true);
            await refreshWalletBalance();
            return;
        }

        // Fallback to API
        const payload = {
            token_address: tokenAddress,
            amount: parseInt(amount),
            recipient: recipient,
            notify: notify,
            sender_address: selectedAddress.toString()
        };

        const response = await fetch(`${API_BASE}/tokens/mint`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showMintResult(resultDiv, data, true);
            await refreshWalletBalance();
        } else {
            showMintResult(resultDiv, { error: data.detail || 'Mint failed' }, false);
        }
    } catch (error) {
        showMintResult(resultDiv, { error: error.message }, false);
    } finally {
        setButtonLoading(btn, false);
    }
}

// Display functions
function showDeployResult(div, data, success) {
    div.style.display = 'block';
    div.className = `result-card ${success ? 'success' : 'error'}`;

    if (success) {
        div.innerHTML = `
            <h3>✓ Token Deployed Successfully</h3>
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
                    <span class="result-value"><a href="${data.explorer_url}" target="_blank">View on Explorer →</a></span>
                </div>
            </div>
        `;
    } else {
        div.innerHTML = `
            <h3>✗ Deployment Failed</h3>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">${data.error}</p>
        `;
    }
}

function showInfoResult(div, data, success) {
    div.style.display = 'block';
    div.className = `info-result-card ${success ? '' : 'error'}`;

    if (success) {
        div.innerHTML = `
            <div class="token-header" style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border);">
                <div class="token-avatar">
                    <span>${data.name.charAt(0).toUpperCase()}</span>
                </div>
                <div class="token-identity">
                    <h3 class="token-name">${data.name}</h3>
                    <span class="token-symbol">${data.symbol}</span>
                </div>
            </div>
            <div class="result-details">
                <div class="result-row">
                    <span class="result-label">Address</span>
                    <span class="result-value">${truncateAddress(data.address)}</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Total Supply</span>
                    <span class="result-value">${formatSupply(data.total_supply, data.decimals)} ${data.symbol}</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Decimals</span>
                    <span class="result-value">${data.decimals}</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Root Owner</span>
                    <span class="result-value">${truncateAddress(data.root_owner)}</span>
                </div>
                <div class="result-row">
                    <span class="result-label">Explorer</span>
                    <span class="result-value"><a href="${data.explorer_url}" target="_blank">View on Explorer →</a></span>
                </div>
            </div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color: var(--error);">✗ Error</h3>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">${data.error}</p>
        `;
    }
}

function showMintResult(div, data, success) {
    div.style.display = 'block';
    div.className = `result-card ${success ? 'success' : 'error'}`;

    if (success) {
        div.innerHTML = `
            <h3>✓ Tokens Minted Successfully</h3>
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
            <h3>✗ Mint Failed</h3>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">${data.error}</p>
        `;
    }
}

// Recent deployments
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
                <a href="${d.explorer_url}" target="_blank">View →</a>
            </div>
        </div>
    `).join('');
}

// Utility functions
function setButtonLoading(btn, loading) {
    if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
        // Only re-enable if wallet is connected (for deploy/mint buttons)
        const isActionButton = btn.id === 'deploy-btn' || btn.id === 'mint-btn';
        if (isActionButton) {
            btn.disabled = !isWalletConnected;
        } else {
            btn.disabled = false;
        }
    }
}

function truncateAddress(address) {
    if (!address || address.length < 20) return address || 'N/A';
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
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

function formatBalance(balance) {
    const num = parseInt(balance, 16) || parseInt(balance) || 0;
    return (num / 1_000_000_000).toFixed(4) + ' TYCHO';
}
