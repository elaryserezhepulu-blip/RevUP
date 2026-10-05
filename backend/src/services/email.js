'use strict';

// Sends the "new registration" notification to the owner's inbox.
// If SMTP isn't configured, it logs the message instead of sending (dev-friendly,
// mirrors the prototype's notifyOwnerOfSignup console.log).
const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!config.smtp.host || !config.smtp.user) return null;
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
  return transporter;
}

// Never let email failure break the request flow — log and move on.
async function sendSignupNotification(user) {
  const to = config.ownerNotificationEmail;
  const subject = `RevUp — new registration: ${user.business}`;
  const text =
    `New RevUp registration\n\n` +
    `Business: ${user.business}\n` +
    `Email: ${user.email}\n` +
    `At: ${new Date().toISOString()}\n`;

  const tx = getTransporter();
  if (!tx || !to) {
    console.log(`[email] (not sent — SMTP/owner email not configured) ${subject} :: ${user.email}`);
    return { sent: false };
  }
  try {
    await tx.sendMail({ from: config.smtp.from, to, subject, text });
    console.log(`[email] signup notification sent to ${to} for ${user.email}`);
    return { sent: true };
  } catch (err) {
    console.error('[email] failed to send signup notification:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendSignupNotification };
