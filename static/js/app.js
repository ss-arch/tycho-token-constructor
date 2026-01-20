// Tycho Token Constructor - Frontend Application

const API_BASE = '';
const recentDeployments = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initForms();
    initLivePreview();
    initDecimalButtons();
    initSupplyPresets();
    refreshWallet();
});

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

// Refresh wallet info
async function refreshWallet() {
    try {
        const response = await fetch(`${API_BASE}/wallet`);
        const data = await response.json();

        document.getElementById('header-balance').textContent = `${data.balance.toFixed(2)} TYCHO`;
    } catch (error) {
        document.getElementById('header-balance').textContent = 'Error';
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

    const supplyRaw = document.getElementById('initial-supply').value.replace(/,/g, '') || '0';
    const decimals = parseInt(document.getElementById('token-decimals').value) || 9;
    const rawSupply = BigInt(supplyRaw) * BigInt(10 ** decimals);

    const payload = {
        name: document.getElementById('token-name').value,
        symbol: document.getElementById('token-symbol').value.toUpperCase(),
        decimals: decimals,
        initial_supply: Number(rawSupply),
        mint_disabled: !document.getElementById('mintable').checked,
        burn_by_root_disabled: !document.getElementById('burnable').checked,
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

    const amount = document.getElementById('mint-amount').value.replace(/,/g, '');

    const payload = {
        token_address: document.getElementById('mint-token-address').value.trim(),
        amount: parseInt(amount),
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
        btn.disabled = false;
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
