import axios from 'axios';
import nodemailer from 'nodemailer';

// Brevo (Sendinblue) settings from env
const BREVO_API_URL = process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// SMTP settings (optional fallback)
const SMTP_USER = process.env.EMAIL_USER;
const SMTP_PASS = process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST; // optional
const SMTP_PORT = process.env.SMTP_PORT; // optional
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'; // optional

const defaultSender = { email: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@yourdomain.com', name: 'Car Rental' };

// Basic exponential backoff with retries for HTTP requests
const postWithRetry = async (url, payload, options = {}, retries = 3, backoffMs = 500) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const resp = await axios.post(url, payload, options);
      return resp;
    } catch (err) {
      const status = err.response?.status;
      // For 4xx (except 429) do not retry
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw err;
      }

      if (attempt < retries - 1) {
        const wait = backoffMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
};

// Fallback to SMTP using nodemailer
const sendViaSMTP = async (toEmail, subject, text, html) => {
  if (!SMTP_USER || !SMTP_PASS) {
    return { success: false, error: 'SMTP credentials not configured' };
  }

  const transporterConfig = SMTP_HOST
    ? { host: SMTP_HOST, port: SMTP_PORT ? Number(SMTP_PORT) : 587, secure: SMTP_SECURE, auth: { user: SMTP_USER, pass: SMTP_PASS } }
    : { service: process.env.EMAIL_SERVICE || 'gmail', auth: { user: SMTP_USER, pass: SMTP_PASS } };

  const transporter = nodemailer.createTransport(transporterConfig);

  try {
    const info = await transporter.sendMail({ from: `${defaultSender.name} <${defaultSender.email}>`, to: toEmail, subject, text, html });
    return { success: true, messageId: info.messageId || null };
  } catch (error) {
    console.error('SMTP fallback failed:', error.message || error);
    return { success: false, error: error.message || 'SMTP send failed' };
  }
};

// Generic send function using Brevo with retries and SMTP fallback
export const sendEmail = async (toEmail, subject, text, html = null) => {
  if (!BREVO_API_KEY) {
    console.warn('BREVO_API_KEY not set — attempting SMTP fallback');
    return await sendViaSMTP(toEmail, subject, text, html || `<p>${text}</p>`);
  }

  const payload = {
    sender: defaultSender,
    to: [{ email: toEmail }],
    subject,
    textContent: text,
    htmlContent: html || `<p>${text}</p>`
  };

  try {
    const resp = await postWithRetry(BREVO_API_URL, payload, {
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      timeout: 15000
    }, 3, 500);

    // brevo returns messageId on success
    const messageId = resp?.data?.messageId || resp?.data?.['messageId'] || null;
    return { success: true, messageId };
  } catch (error) {
    console.error('Brevo send failed:', error.response?.data || error.message || error);
    // If Brevo fails, try SMTP fallback
    const smtpResult = await sendViaSMTP(toEmail, subject, text, html);
    if (smtpResult.success) return smtpResult;
    return { success: false, error: smtpResult.error || (error.response?.data || error.message) };
  }
};

// Function to send OTP via Brevo (keeps old interface)
export const sendOtpEmail = async (email, otp, isPasswordReset = false) => {
  const subject = isPasswordReset ? 'Password Reset OTP' : 'Email Verification OTP';
  const text = isPasswordReset
    ? `Your OTP for password reset is: ${otp}. This OTP will expire in 5 minutes.`
    : `Your OTP for email verification is: ${otp}. This OTP will expire in 5 minutes.`;

  return await sendEmail(email, subject, text);
};

// Function to generate a random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default { sendOtpEmail, generateOTP, sendEmail };