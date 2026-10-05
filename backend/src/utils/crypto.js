'use strict';

// AES-256-GCM encryption for secrets stored at rest (POS API keys).
// The key is derived from APP_ENCRYPTION_KEY, or from JWT_SECRET in dev.
const crypto = require('crypto');
const config = require('../config/env');

let warned = false;
function getKey() {
  let secret = config.encryptionKey;
  if (!secret) {
    if (config.isProd) {
      throw new Error('APP_ENCRYPTION_KEY is required to store POS credentials in production.');
    }
    if (!warned) {
      console.warn('[crypto] APP_ENCRYPTION_KEY not set — deriving key from JWT_SECRET (dev only).');
      warned = true;
    }
    secret = config.jwtSecret;
  }
  // Derive a stable 32-byte key from whatever secret we have.
  return crypto.createHash('sha256').update(String(secret)).digest();
}

function encrypt(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const enc = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Store as iv:tag:ciphertext, all base64.
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join(':');
}

function decrypt(blob) {
  const [ivB64, tagB64, dataB64] = String(blob).split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

module.exports = { encrypt, decrypt };
