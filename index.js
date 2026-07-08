require('dotenv').config();

const db = require('./db');
const { getUpdates, sendMessage } = require('./telegramClient');
const { answerQuestion } = require('./ai');

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
  if (!msg) return;
  if (!msg.text) return;
  if (msg.chat.type !== 'private' && !msg.text.includes('@')) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const firstName = msg.from?.first_name || 'there';

  db.logConversation(chatId, 'in', text);

  const reply = async (replyText) => {
    db.logConversation(chatId, 'out', replyText);
    return sendMessage(chatId, replyText);
  };

  try {
    // Admin commands
    if (String(chatId) === ADMIN_CHAT_ID) {
      if (text === '/admin_stats') {
        const stats = db.statsByStatus();
        const msg = stats.map(s => `${s.status}: ${s.count}`).join('\n');
        return reply(`Payment Stats:\n${msg}`);
      }
      if (text.startsWith('/admin_verify')) {
        const code = text.replace('/admin_verify', '').trim();
        if (!code) return reply('Usage: /admin_verify CODE');
        db.setPaymentStatus(code, 'verified', 'verified_at');
        return reply(`Verified: ${code}`);
      }
    }

    // User commands
    if (text === '/start') {
      return reply(
        `Hey ${firstName}! 👋 I'm Asap Network Bot. Ask me anything about Web3, crypto, blockchain, DeFi, NFTs, and DAOs!\n\n` +
        `Commands:\n` +
        `/help - Show all commands\n` +
        `/pay - Payment info\n` +
        `/register Name|email@test.com - Sign up\n\n` +
        `Just ask me anything! I'll use AI to help you. 🤖`
      );
    }

    if (text === '/help') {
      return reply(
        'Asap Network Commands:\n\n' +
        '/start - Welcome message\n' +
        '/help - This message\n' +
        '/pay - Payment options\n' +
        '/register Name|email - Register as user\n\n' +
        'Just type any question and I\'ll answer using AI! 🧠'
      );
    }

    if (text === '/pay') {
      return reply(
        `💰 Payment Info:\n\n` +
        `Wallet (USDT BEP20): ${process.env.USDT_BEP20_ADDRESS || 'Contact support'}\n` +
        `Support: ${process.env.SUPPORT_TELEGRAM_HANDLE || '@support'}\n\n` +
        `After payment, message support with:\n` +
        `- Course name\n` +
        `- Your email\n` +
        `- Transaction hash`
      );
    }

    if (text.startsWith('/register')) {
      const rest = text.replace('/register', '').trim();
      if (!rest) {
        return reply('Format: /register Name|email@example.com');
      }
      const parts = rest.split('|').map(s => s.trim());
      const [name, email] = parts;

      if (!name || !email) {
        return reply('Format: /register Name|email@example.com');
      }

      db.insertLead({ name, email, phone: null, telegram_id: String(chatId), now: new Date().toISOString() });
      await reply('✅ Registered! Welcome to Asap Network!');

      const adminId = process.env.ADMIN_CHAT_ID;
      if (adminId) {
        await sendMessage(adminId, `📝 New Lead: ${name} (${email})\nTelegram: ${chatId}`);
      }
      return;
    }

    // Everything else -> Use Groq AI to answer
    console.log(`[${new Date().toISOString()}] Question from ${chatId}: ${text}`);
    
    await reply('🤖 Thinking...');
    
    const answer = await answerQuestion(text);
    
    if (answer) {
      return reply(answer);
    } else {
      return reply(
        '💭 I couldn\'t process that right now. Try again in a moment!\n\n' +
        'Commands: /help, /pay, /register'
      );
    }
  } catch (err) {
    console.error('Error processing update:', err);
    await reply('❌ Something went wrong — try again in a moment.').catch(() => {});
  }
}

async function main() {
  console.log(`🤖 Asap Network Bot starting...`);
  console.log(`📱 Token: ${process.env.TELEGRAM_BOT_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`🧠 Groq API: ${process.env.GROQ_API_KEY ? '✅ Available' : '⚠️  Not configured'}`);
  console.log(`👤 Admin ID: ${ADMIN_CHAT_ID}`);

  let offset = Number(db.getState('last_update_id') || 0) + 1;

  while (running) {
    let updates = [];
    try {
      updates = await getUpdates(offset);
    } catch (err) {
      console.error(`❌ Poll error: ${err.message}`);
      await sleep(5000);
      continue;
    }

    if (updates.length > 0) {
      console.log(`📨 Received ${updates.length} update(s)`);
    }

    for (const update of updates) {
      await processUpdate(update);
      offset = update.update_id + 1;
      db.setState('last_update_id', offset - 1);
    }
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
