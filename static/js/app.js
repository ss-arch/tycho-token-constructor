// Tycho Token Constructor - Frontend Application

const API_BASE = '';
const recentDeployments = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initForms();
    refreshWallet();
});

// Tab functionality
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');
            const tabId = tab.dataset.tab;
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Form handlers
function initForms() {
    // Deploy form
    document.getElementById('deploy-form').addEventListener('submit', handleDeploy);

    // Info form
    document.getElementById('info-form').addEventListener('submit', handleGetInfo);

    // Mint form
    document.getElementById('mint-form').addEventListener('submit', handleMint);
}

// Refresh wallet info
async function refreshWallet() {
    try {
        const response = await fetch(`${API_BASE}/wallet`);
        const data = await response.json();

        document.getElementById('wallet-address').textContent = truncateAddress(data.address);
        document.getElementById('wallet-address').title = data.address;
        document.getElementById('wallet-balance').textContent = `${data.balance.toFixed(4)} tokens`;
        document.getElementById('network-name').textContent = data.network;
    } catch (error) {
        document.getElementById('wallet-address').textContent = 'Error loading';
        document.getElementById('wallet-balance').textContent = 'Error loading';
        document.getElementById('network-name').textContent = 'Error loading';
        console.error('Failed to load wallet info:', error);
    }
}

// Deploy token handler
async function handleDeploy(e) {
    e.preventDefault();

    const btn = document.getElementById('deploy-btn');
    const resultDiv = document.getElementById('deploy-result');

    setButtonLoading(btn, true);
    resultDiv.style.display = 'none';

    const payload = {
        name: document.getElementById('token-name').value,
        symbol: document.getElementById('token-symbol').value,
        decimals: parseInt(document.getElementById('token-decimals').value) || 9,
        initial_supply: parseInt(document.getElementById('initial-supply').value) || 0,
        mint_disabled: document.getElementById('mint-disabled').checked,
        burn_by_root_disabled: document.getElementById('burn-disabled').checked,
        burn_paused: document.getElementById('burn-paused').checked
    };

    const initialSupplyTo = document.getElementById('initial-supply-to').value.trim();
    if (initialSupplyTo) {
        payload.initial_supply_to = initialSupplyTo;
    }

    try {
        const response = await fetch(`${API_BASE}/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showDeployResult(resultDiv, data, true);
            addRecentDeployment(data);
            refreshWallet();
            // Clear form
            document.getElementById('deploy-form').reset();
            document.getElementById('token-decimals').value = 9;
        } else {
            showDeployResult(resultDiv, { error: data.detail || 'Deployment failed' }, false);
        }
    } catch (error) {
        showDeployResult(resultDiv, { error: error.message }, false);
    } finally {
        setButtonLoading(btn, false);
    }
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

    const btn = document.getElementById('mint-btn');
    const resultDiv = document.getElementById('mint-result');

    setButtonLoading(btn, true);
    resultDiv.style.display = 'none';

    const payload = {
        token_address: document.getElementById('mint-token-address').value.trim(),
        amount: parseInt(document.getElementById('mint-amount').value),
        recipient: document.getElementById('mint-recipient').value.trim(),
        notify: document.getElementById('mint-notify').checked
    };

    try {
        const response = await fetch(`${API_BASE}/tokens/mint`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showMintResult(resultDiv, data, true);
            refreshWallet();
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
    div.className = `result ${success ? 'success' : 'error'}`;

    if (success) {
        div.innerHTML = `
            <h3>✓ Token Deployed Successfully</h3>
            <div class="result-details">
                <div class="detail-row">
                    <span class="detail-label">Address</span>
                    <span class="detail-value mono">${truncateAddress(data.address)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${data.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Symbol</span>
                    <span class="detail-value">${data.symbol}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Decimals</span>
                    <span class="detail-value">${data.decimals}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Initial Supply</span>
                    <span class="detail-value">${formatSupply(data.initial_supply, data.decimals)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Transaction</span>
                    <span class="detail-value mono">${truncateAddress(data.transaction_id)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Explorer</span>
                    <span class="detail-value"><a href="${data.explorer_url}" target="_blank">View on Explorer →</a></span>
                </div>
            </div>
        `;
    } else {
        div.innerHTML = `
            <h3>✗ Deployment Failed</h3>
            <p>${data.error}</p>
        `;
    }
}

function showInfoResult(div, data, success) {
    div.style.display = 'block';
    div.className = `result ${success ? 'success' : 'error'}`;

    if (success) {
        div.innerHTML = `
            <h3>✓ Token Information</h3>
            <div class="result-details">
                <div class="detail-row">
                    <span class="detail-label">Address</span>
                    <span class="detail-value mono">${truncateAddress(data.address)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${data.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Symbol</span>
                    <span class="detail-value">${data.symbol}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Decimals</span>
                    <span class="detail-value">${data.decimals}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Supply</span>
                    <span class="detail-value">${formatSupply(data.total_supply, data.decimals)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Root Owner</span>
                    <span class="detail-value mono">${truncateAddress(data.root_owner)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Contract Balance</span>
                    <span class="detail-value">${formatBalance(data.balance)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Explorer</span>
                    <span class="detail-value"><a href="${data.explorer_url}" target="_blank">View on Explorer →</a></span>
                </div>
            </div>
        `;
    } else {
        div.innerHTML = `
            <h3>✗ Error</h3>
            <p>${data.error}</p>
        `;
    }
}

function showMintResult(div, data, success) {
    div.style.display = 'block';
    div.className = `result ${success ? 'success' : 'error'}`;

    if (success) {
        div.innerHTML = `
            <h3>✓ Tokens Minted Successfully</h3>
            <div class="result-details">
                <div class="detail-row">
                    <span class="detail-label">Transaction</span>
                    <span class="detail-value mono">${truncateAddress(data.transaction_id)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Message</span>
                    <span class="detail-value">${data.message}</span>
                </div>
            </div>
        `;
    } else {
        div.innerHTML = `
            <h3>✗ Mint Failed</h3>
            <p>${data.error}</p>
        `;
    }
}

// Add to recent deployments
function addRecentDeployment(data) {
    recentDeployments.unshift(data);
    updateRecentDeployments();
}

function updateRecentDeployments() {
    const container = document.getElementById('recent-deployments');

    if (recentDeployments.length === 0) {
        container.innerHTML = '<p class="empty-state">No tokens deployed yet in this session.</p>';
        return;
    }

    container.innerHTML = recentDeployments.map(d => `
        <div class="deployment-item">
            <div class="deployment-info">
                <span class="deployment-name">${d.name} (${d.symbol})</span>
                <span class="deployment-address">${truncateAddress(d.address)}</span>
            </div>
            <div class="deployment-actions">
                <a href="${d.explorer_url}" target="_blank">Explorer →</a>
            </div>
        </div>
    `).join('');
}

// Utility functions
function setButtonLoading(btn, loading) {
    const textSpan = btn.querySelector('.btn-text');
    const loadingSpan = btn.querySelector('.btn-loading');

    if (loading) {
        textSpan.style.display = 'none';
        loadingSpan.style.display = 'inline-flex';
        btn.disabled = true;
    } else {
        textSpan.style.display = 'inline';
        loadingSpan.style.display = 'none';
        btn.disabled = false;
    }
}

function truncateAddress(address) {
    if (!address || address.length < 20) return address || 'N/A';
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

function formatSupply(supply, decimals) {
    const num = BigInt(supply);
    const divisor = BigInt(10 ** decimals);
    const whole = num / divisor;
    const fraction = num % divisor;

    if (fraction === 0n) {
        return whole.toLocaleString();
    }

    const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
    return `${whole.toLocaleString()}.${fractionStr}`;
}

function formatBalance(balance) {
    const num = parseInt(balance, 16) || parseInt(balance) || 0;
    return (num / 1_000_000_000).toFixed(4) + ' tokens';
}
