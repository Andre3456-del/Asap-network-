const fetch = require('node-fetch');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is missing from .env');
}

const API_BASE = `https://api.telegram.org/bot${TOKEN}`;
const POLL_TIMEOUT = Number(process.env.POLL_TIMEOUT_SECONDS || 30);

/**
 * Long-poll Telegram for new updates. Blocks (server-side, cheap) up to
 * POLL_TIMEOUT seconds. Returns an array (possibly empty) of update objects.
 */
async function getUpdates(offset) {
  const url = `${API_BASE}/getUpdates?offset=${offset}&limit=20&timeout=${POLL_TIMEOUT}`;
  const res = await fetch(url, { timeout: (POLL_TIMEOUT + 10) * 1000 });
  if (!res.ok) {
    throw new Error(`getUpdates failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`getUpdates returned ok=false: ${JSON.stringify(data)}`);
  }
  return data.result;
}

async function sendMessage(chatId, text, extra = {}) {
  const res = await fetch(`${API_BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
      ...extra,
    }),
  });
  const data = await res.json();
  if (!data.ok) {
    console.error('sendMessage failed:', data);
  }
  return data;
}

module.exports = { getUpdates, sendMessage };
