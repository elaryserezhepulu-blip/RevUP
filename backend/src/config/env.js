'use strict';

require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

function bool(v, def = false) {
  if (v === undefined || v === '') return def;
  return /^(1|true|yes|on)$/i.test(String(v));
}

function fail(msg) {
  console.error(`[config] ${msg}`);
  process.exit(1);
}

// DATABASE_URL is mandatory everywhere — nothing works without it.
if (!process.env.DATABASE_URL) {
  fail(
    'DATABASE_URL is not set. Copy .env.example to .env and point it at your Postgres ' +
      '(e.g. start one with `docker compose up -d`).'
  );
}

// JWT secret: required in production; dev gets a clearly-marked fallback.
let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProd) fail('JWT_SECRET is required in production.');
  jwtSecret = 'dev-insecure-secret-change-me';
  console.warn('[config] JWT_SECRET not set — using an insecure dev fallback. Tokens are NOT safe.');
}

const config = {
  env,
  isProd,
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',

  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: bool(process.env.DATABASE_SSL, false),

  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',

  // Falls back to JWT_SECRET-derived key in dev (see utils/crypto.js).
  encryptionKey: process.env.APP_ENCRYPTION_KEY || '',

  subscriptionPriceKzt: parseInt(process.env.SUBSCRIPTION_PRICE_KZT || '40000', 10),
  freeReports: parseInt(process.env.FREE_REPORTS || '1', 10),

  stubPos: !isProd && bool(process.env.STUB_POS, true),

  ownerNotificationEmail: process.env.OWNER_NOTIFICATION_EMAIL || '',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'RevUp <no-reply@revup.kz>',
  },
};

module.exports = config;
