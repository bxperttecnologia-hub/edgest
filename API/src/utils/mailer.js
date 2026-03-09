/* mailer placeholder */
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
  console.warn('⚠️ Mailer: Variáveis de ambiente SMTP incompletas.');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // porta 465 geralmente é secure
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

async function sendEmail(to, subject, html) {
  if (!to) {
    throw new Error('Destinatário do email não definido');
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`📧 Email enviado para ${to} | messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Erro ao enviar email para ${to}:`, err.message);
    throw err;
  }
}

module.exports = { sendEmail };