require('dotenv').config();

const db = require('./db');
const { getUpdates, sendMessage } = require('./telegramClient');
const { handleAdminCommand } = require('./handlers/adminCommands');
const { handleUserCommand } = require('./handlers/userCommands');

const ADMIN_CHAT_ID = String(process.env.ADMIN_CHAT_ID || '');

let running = true;
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  running = false;
});
process.on('SIGTERM', () => {
  running = false;
});

async function processUpdate(update) {
  const msg = update.message;
  if (!msg) return; // skip edited_message, callback_query, etc.
  if (!msg.text) return; // skip non-text
  if (msg.chat.type !== 'private' && !msg.text.includes('@')) return; // skip group noise w/o mention

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  db.logConversation(chatId, 'in', text);

  const reply = async (replyText) => {
    db.logConversation(chatId, 'out', replyText);
    return sendMessage(chatId, replyText);
  };

  try {
    if (String(chatId) === ADMIN_CHAT_ID) {
      const handled = await handleAdminCommand(text, reply);
      if (handled) return;
      // Admin sending a non-admin-command message falls through to normal user flow
      // (so the admin can still test /courses, ask questions, etc.)
    }
    await handleUserCommand(msg, reply);
  } catch (err) {
    console.error('Error processing update:', err);
    await reply('Something went wrong on my end — try again in a moment.').catch(() => {});
  }
}

async function main() {
  console.log('Web3 Learn Bot starting (standalone long-polling mode)...');

  let offset = Number(db.getState('last_update_id') || 0) + 1;

  while (running) {
    let updates = [];
    try {
      updates = await getUpdates(offset);
    } catch (err) {
      console.error('Poll error, retrying in 5s:', err.message);
      await sleep(5000);
      continue;
    }

    for (const update of updates) {
      await processUpdate(update);
      offset = update.update_id + 1;
      db.setState('last_update_id', offset - 1);
    }
    // No updates -> loop immediately re-polls (long polling keeps this cheap)
  }

  console.log('Stopped.');
  process.exit(0);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
