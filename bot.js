const TelegramBot = require('node-telegram-bot-api');
const DATABASE = require("./database.json");
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const bot = new TelegramBot(DATABASE.telegramBotToken, { polling: false });

function sendMessageToChat(chat_id, message, reply_markup = null) {
    try {
        if (!chat_id) {
            console.log('[TELEGRAM] No chat_id provided, skipping send');
            return Promise.resolve();
        }
        console.log(`[TELEGRAM] Sending to chat ${chat_id}: ${message.substring(0, 50)}...`);
        return bot.sendMessage(chat_id, message, { parse_mode: "html", disable_web_page_preview: true, reply_markup }).then(result => {
            console.log('[TELEGRAM] Message sent successfully');
            return result;
        }).catch(err => {
            console.error('[TELEGRAM ERROR]', err.message);
            throw err;
        });
    } catch (error) {
        console.error('[TELEGRAM CATCH ERROR]', error.message);
        throw error;
    }
}

async function initTG() {
    //
}

module.exports = { initTG, sendMessageToChat }