const db = require('../db');
const { sendMessage } = require('../telegramClient');
const { getCourseOfferings, getPricing, findVideo } = require('../services/knowledge');
const { answerQuestion } = require('../services/ai');

function walletAddress() {
  return process.env.USDT_BEP20_ADDRESS || '0xYOUR_WALLET_HERE';
}
function supportHandle() {
  return process.env.SUPPORT_TELEGRAM_HANDLE || '@support';
}

async function handleUserCommand(msg, reply) {
  const text = (msg.text || '').trim();
  const firstName = msg.from?.first_name || 'there';
  const chatId = msg.chat.id;

  if (text === '/start') {
    return reply(
      `Hey ${firstName}! I'm Web3 Learn AI. Ask me about blockchain, crypto, DeFi, NFTs, DAOs - ` +
      `I'll reply with text + a YouTube video! Pay with USDT: /pay`
    );
  }

  if (text === '/help') {
    return reply(
      'Ask anything Web3! Commands: /courses /pricing /pay /video {topic}. ' +
      'Pay USDT (BEP20) to unlock premium courses!'
    );
  }

  if (text === '/courses') {
    return reply(
      `${getCourseOfferings()}\n\nPay USDT to ${walletAddress()}. Then DM ${supportHandle()} your TX hash + email to get access.`
    );
  }

  if (text === '/pricing') {
    return reply(`${getPricing()}\n\nPay USDT to ${walletAddress()}`);
  }

  if (text === '/pay') {
    return reply(
      `Send USDT (BEP20) to: ${walletAddress()}.\n` +
      `DeFi $10 | NFT $12 | DAO $12 | SC $15 | Security $15.\n` +
      `After payment, DM ${supportHandle()} with: Course name, Your email, TX hash`
    );
  }

  if (text === '/paid' || text.startsWith('/paid ')) {
    return reply(`Admin only. DM ${supportHandle()} to process your payment.`);
  }

  if (text.startsWith('/register')) {
    // Expected format: /register Name|email@example.com|+1234567890
    const rest = text.replace('/register', '').trim();
    const parts = rest.split('|').map((s) => s.trim());
    const [name, email, phone] = parts;

    if (!name || !email) {
      return reply('Format: /register Name|email@example.com|phone (phone optional)');
    }

    db.insertLead({ name, email, phone: phone || null, telegram_id: String(chatId), now: new Date().toISOString() });
    await reply('Listed!');

    const adminId = process.env.ADMIN_CHAT_ID;
    if (adminId) {
      await sendMessage(adminId, `Lead: ${name} (${chatId})`);
    }
    return;
  }

  if (text.startsWith('/video')) {
    const topic = text.replace('/video', '').trim();
    if (!topic) return reply('Usage: /video defi  (or any topic)');
    const video = findVideo(topic);
    if (!video) return reply(`No video found for "${topic}" yet. Try /courses for what we cover.`);
    return reply(`🎥 ${video.title}\n${video.url}`);
  }

  // Fallback: free-form question -> AI + possible video suggestion
  const answer = await answerQuestion(text);
  const video = findVideo(text);
  const videoLine = video ? `\n\n🎥 ${video.title}\n${video.url}` : '';
  return reply(`${answer}${videoLine}\n\nCourses from $10: /pay`);
}

module.exports = { handleUserCommand };
