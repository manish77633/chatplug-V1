const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Log on startup if configured
if (process.env.RESEND_API_KEY) {
  console.log('✅ Resend configured for email delivery');
} else {
  console.warn('⚠️  RESEND_API_KEY not set — email notifications will NOT be sent');
}

async function sendEmail({ to, subject, text, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.error(`[email] Cannot send to ${to} — RESEND_API_KEY not configured`);
    return;
  }

  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error(`[email] FAILED to send "${subject}" to ${to}:`, error.message);
      throw error;
    }

    console.log(`[email] Sent "${subject}" to ${to} — id: ${data?.id}`);
    return data;
  } catch (err) {
    console.error(`[email] FAILED to send "${subject}" to ${to}:`, err.message);
    throw err;
  }
}

module.exports = { sendEmail };