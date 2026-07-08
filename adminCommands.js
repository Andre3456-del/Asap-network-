const db = require('../db');
const { generateAccessCode } = require('../utils/accessCode');
const { sendMessage } = require('../telegramClient');
const { sendActivationEmail } = require('../services/email');

// /paid "Course Name" email@example.com telegram_id 0xTXHASH
// (telegram_id is the CUSTOMER's chat id, not the admin's — get it by asking them
//  to /start the bot once, or by having them /register first)
const PAID_RE = /^\/paid\s+"([^"]+)"\s+(\S+)\s+(\S+)\s+(\S+)/i;
// /verify CODE   /activate CODE   /reject CODE
const CODE_CMD_RE = /^\/(verify|activate|reject)\s+(\S+)/i;

async function handlePaid(text, reply) {
  const match = text.match(PAID_RE);
  if (!match) {
    return reply(
      'Format: /paid "Course Name" email@example.com telegram_id 0xTXHASH\n' +
      '(Get their telegram_id from /pending leads or ask them to /start the bot)'
    );
  }
  const [, course, email, telegramId, txHash] = match;

  const existing = db.findPaymentByTxHash(txHash);
  if (existing) {
    return reply('Already claimed.');
  }

  const code = generateAccessCode();
  db.insertPayment({
    id: code,
    username: null,
    telegram_id: telegramId,
    email,
    course,
    amount: null,
    access_code: code,
    tx_hash: txHash,
    now: new Date().toISOString(),
  });

  return reply(`Inserted: ${course} | ${email} | ${telegramId} | ${txHash} | Code: ${code}`);
}

async function handleVerify(code, reply) {
  const row = db.findPaymentByCode(code);
  if (!row) return reply('Not found.');
  db.setPaymentStatus(code, 'verified', 'verified_at');
  return reply(`Verified: ${row.username || row.email} | ${row.course} | ${row.amount ?? '-'}`);
}

async function handleActivate(code, reply) {
  const row = db.findPaymentByCode(code);
  if (!row) return reply('Not found.');

  db.setPaymentStatus(code, 'active', 'activated_at');
  await reply(`Activated: ${row.username || row.email} | ${row.course} | ${row.email || '-'}`);

  // Notify user on Telegram (only if we know their telegram_id)
  if (row.telegram_id) {
    await sendMessage(
      row.telegram_id,
      `🚀 Access granted! Course: ${row.course}. Code: ${row.access_code}. Start learning: /courses`
    );
  }

  // Notify user via email
  if (row.email) {
    const result = await sendActivationEmail({
      to: row.email,
      course: row.course,
      code: row.access_code,
      username: row.username,
    });
    if (!result.ok) {
      await reply(`⚠️ Email to ${row.email} failed: ${result.error}`);
    }
  }
}

async function handleReject(code, reply) {
  const row = db.findPaymentByCode(code);
  if (!row) return reply('Not found.');

  db.setPaymentStatus(code, 'rejected', 'rejected_at');
  await reply(`Rejected: ${row.username || row.email} | ${row.course}`);

  if (row.telegram_id) {
    const supportHandle = process.env.SUPPORT_TELEGRAM_HANDLE || '@support';
    await sendMessage(
      row.telegram_id,
      `Your payment for ${row.course} could not be verified. DM ${supportHandle} for help.`
    );
  }
}

async function handlePending(reply) {
  const rows = db.listPending();
  if (rows.length === 0) return reply('No pending payments.');
  const lines = rows.map(
    (r) => `${r.access_code} | ${r.course} | ${r.email || r.username || '-'} | ${r.tx_hash}`
  );
  return reply(lines.join('\n'));
}

async function handleStats(reply) {
  const rows = db.statsByStatus();
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const lines = rows.map((r) => `${r.status}: ${r.count}`);
  lines.push(`total: ${total}`);
  return reply(lines.join('\n'));
}

/**
 * Routes an admin-only message to the right handler.
 * Returns true if the message was handled as an admin command.
 */
async function handleAdminCommand(text, reply) {
  if (text.startsWith('/paid')) {
    await handlePaid(text, reply);
    return true;
  }

  const codeMatch = text.match(CODE_CMD_RE);
  if (codeMatch) {
    const [, cmd, code] = codeMatch;
    if (cmd.toLowerCase() === 'verify') await handleVerify(code, reply);
    if (cmd.toLowerCase() === 'activate') await handleActivate(code, reply);
    if (cmd.toLowerCase() === 'reject') await handleReject(code, reply);
    return true;
  }

  if (text.startsWith('/pending')) {
    await handlePending(reply);
    return true;
  }

  if (text.startsWith('/stats')) {
    await handleStats(reply);
    return true;
  }

  return false;
}

module.exports = { handleAdminCommand };
