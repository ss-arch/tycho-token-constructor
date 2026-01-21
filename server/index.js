const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3001;
const TYCHO_EXPLORER = 'https://testnet.tychoprotocol.com';

// Token cache
let tokenCache = [];
let lastFetch = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fetch tokens from Tycho Explorer
async function fetchTokensFromExplorer() {
    return new Promise((resolve, reject) => {
        // Try multiple possible API endpoints
        const endpoints = [
            '/api/v1/tokens?limit=1000',
            '/api/tokens?limit=1000',
            '/v1/tokens?limit=1000'
        ];

        let tried = 0;

        function tryEndpoint(endpoint) {
            const reqUrl = `${TYCHO_EXPLORER}${endpoint}`;
            console.log(`Trying: ${reqUrl}`);

            https.get(reqUrl, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const json = JSON.parse(data);
                            const tokens = json.tokens || json.data || json || [];
                            if (Array.isArray(tokens) && tokens.length > 0) {
                                console.log(`Success! Got ${tokens.length} tokens from ${endpoint}`);
                                resolve(tokens);
                                return;
                            }
                        } catch (e) {
                            console.log(`Parse error for ${endpoint}:`, e.message);
                        }
                    }

                    tried++;
                    if (tried < endpoints.length) {
                        tryEndpoint(endpoints[tried]);
                    } else {
                        console.log('All endpoints failed, using empty array');
                        resolve([]);
                    }
                });
            }).on('error', (err) => {
                console.log(`Error for ${endpoint}:`, err.message);
                tried++;
                if (tried < endpoints.length) {
                    tryEndpoint(endpoints[tried]);
                } else {
                    resolve([]);
                }
            });
        }

        tryEndpoint(endpoints[0]);
    });
}

// Scrape tokens from HTML page (fallback)
async function scrapeTokensFromPage() {
    return new Promise((resolve, reject) => {
        https.get(`${TYCHO_EXPLORER}/tokens`, (res) => {
            let html = '';
            res.on('data', chunk => html += chunk);
            res.on('end', () => {
                // Try to extract token data from HTML
                const tokens = [];

                // Look for JSON data in script tags
                const jsonMatch = html.match(/window\.__INITIAL_DATA__\s*=\s*({.*?});/s);
                if (jsonMatch) {
                    try {
                        const data = JSON.parse(jsonMatch[1]);
                        if (data.tokens) {
                            resolve(data.tokens);
                            return;
                        }
                    } catch (e) {}
                }

                // Look for token addresses in the page
                const addressMatches = html.matchAll(/0:[a-fA-F0-9]{64}/g);
                for (const match of addressMatches) {
                    if (!tokens.find(t => t.address === match[0])) {
                        tokens.push({ address: match[0] });
                    }
                }

                resolve(tokens);
            });
        }).on('error', () => resolve([]));
    });
}

async function getTokens() {
    const now = Date.now();

    // Return cached if fresh
    if (tokenCache.length > 0 && lastFetch && (now - lastFetch) < CACHE_TTL) {
        return tokenCache;
    }

    // Fetch fresh data
    console.log('Fetching fresh token data...');

    let tokens = await fetchTokensFromExplorer();

    // Fallback to scraping if API fails
    if (tokens.length === 0) {
        console.log('API failed, trying scrape...');
        tokens = await scrapeTokensFromPage();
    }

    if (tokens.length > 0) {
        tokenCache = tokens;
        lastFetch = now;
    }

    return tokenCache;
}

// HTTP Server
const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    if (path === '/api/tokens' || path === '/tokens') {
        try {
            const tokens = await getTokens();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                count: tokens.length,
                lastUpdate: lastFetch ? new Date(lastFetch).toISOString() : null,
                tokens: tokens
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
        }
    } else if (path === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', cached: tokenCache.length }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Token proxy server running on port ${PORT}`);
    console.log(`Endpoints:`);
    console.log(`  GET /api/tokens - Get all tokens`);
    console.log(`  GET /health - Health check`);

    // Pre-fetch tokens on startup
    getTokens().then(tokens => {
        console.log(`Initial fetch: ${tokens.length} tokens loaded`);
    });
});
