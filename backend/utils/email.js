const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, text, html }) {
  const msg = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(msg);
}

module.exports = { sendEmail, transporter };
