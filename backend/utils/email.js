const nodemailer = require('nodemailer');
const dns = require('dns');

// Force Node.js to prefer IPv4 — Render free tier blocks IPv6
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Test connection on startup so we know if email is misconfigured
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify()
    .then(() => console.log('✅ SMTP connection verified — emails will send'))
    .catch(err => console.error('❌ SMTP connection FAILED — check EMAIL_USER/EMAIL_PASS:', err.message));
}

async function sendEmail({ to, subject, text, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error(`[email] Cannot send to ${to} — EMAIL_USER/EMAIL_PASS not configured`);
    return;
  }

  const msg = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(msg);
    console.log(`[email] Sent "${subject}" to ${to} — messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[email] FAILED to send "${subject}" to ${to}:`, err.message);
    if (err.response) console.error('[email] SMTP response:', err.response);
    throw err;
  }
}

module.exports = { sendEmail, transporter };