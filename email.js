const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      'GMAIL_USER / GMAIL_APP_PASSWORD missing from .env. ' +
      'Create an App Password at https://myaccount.google.com/apppasswords'
    );
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Send the activation email. Returns { ok: true, id } or { ok: false, error }.
 */
async function sendActivationEmail({ to, course, code, username }) {
  const fromName = process.env.EMAIL_FROM_NAME || 'Web3 Learn AI';
  const user = process.env.GMAIL_USER;

  const text =
    `Hey ${username || 'there'}!\n\n` +
    `Your access to ${course} is now live!\n\n` +
    `Code: ${code}\n` +
    `Start learning: DM @Net_workasapbot on Telegram with /courses\n\n` +
    `- ${fromName}`;

  const html = `
    <div style="font-family: sans-serif; line-height:1.5;">
      <p>Hey ${escapeHtml(username || 'there')}! 🚀</p>
      <p>Your access to <b>${escapeHtml(course)}</b> is now live!</p>
      <p><b>Code:</b> ${escapeHtml(code)}</p>
      <p>Start learning: DM <b>@Net_workasapbot</b> on Telegram with <code>/courses</code></p>
      <p style="color:#666;">- ${escapeHtml(fromName)}</p>
    </div>
  `;

  try {
    const info = await getTransporter().sendMail({
      from: `"${fromName}" <${user}>`,
      to,
      subject: `Access Granted - ${course}`,
      text,
      html,
    });
    return { ok: true, id: info.messageId };
  } catch (err) {
    console.error('Email send failed:', err.message);
    return { ok: false, error: err.message };
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = { sendActivationEmail };
