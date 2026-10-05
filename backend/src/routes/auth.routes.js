'use strict';

const express = require('express');
const { query, withTransaction } = require('../db/pool');
const { serializeUser } = require('../db/serializers');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { ApiError, asyncHandler } = require('../middleware/error');
const { requireAuth } = require('../middleware/auth');
const { sendSignupNotification } = require('../services/email');

const router = express.Router();

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function tokenFor(user) {
  return signToken({ sub: user.id, email: user.email });
}

// POST /api/auth/signup
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const business = String(req.body.business || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!business) throw new ApiError(400, 'Please enter your business name.');
    if (!EMAIL_RE.test(email)) throw new ApiError(400, 'Please enter a valid email.');
    if (password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters.');

    const existing = await query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rowCount) throw new ApiError(409, 'An account with this email already exists.');

    const passwordHash = await hashPassword(password);

    // Create the user and a default first store in one transaction (mirrors the
    // prototype, which seeds a "Main Store" in Astana on signup).
    const user = await withTransaction(async (client) => {
      const u = await client.query(
        `INSERT INTO users (business, email, password_hash)
         VALUES ($1, $2, $3) RETURNING *`,
        [business, email, passwordHash]
      );
      await client.query(
        `INSERT INTO stores (user_id, name, location) VALUES ($1, $2, $3)`,
        [u.rows[0].id, 'Main Store', 'Astana']
      );
      return u.rows[0];
    });

    // Registration notification — non-blocking, never fails the signup.
    sendSignupNotification(user).catch(() => {});

    res.status(201).json({ token: tokenFor(user), user: serializeUser(user) });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    // Same error whether the email is unknown or the password is wrong.
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new ApiError(401, 'Wrong email or password.');
    }
    res.json({ token: tokenFor(user), user: serializeUser(user) });
  })
);

// GET /api/auth/me
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.auth.userId]);
    if (!result.rowCount) throw new ApiError(404, 'User not found.');
    res.json({ user: serializeUser(result.rows[0]) });
  })
);

module.exports = router;
