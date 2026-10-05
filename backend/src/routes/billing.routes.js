'use strict';

const express = require('express');
const { query } = require('../db/pool');
const { serializeUser } = require('../db/serializers');
const { createCheckout, verifyWebhook } = require('../services/payment');
const { ApiError, asyncHandler } = require('../middleware/error');
const { requireAuth } = require('../middleware/auth');
const config = require('../config/env');

const router = express.Router();

// GET /api/billing/plan  — public plan details for the paywall screen.
router.get('/plan', (req, res) => {
  res.json({ priceKzt: config.subscriptionPriceKzt, freeReports: config.freeReports, period: 'year' });
});

// POST /api/billing/subscribe  — start (and, in the stub, complete) a subscription.
router.post(
  '/subscribe',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userRes = await query('SELECT * FROM users WHERE id = $1', [req.auth.userId]);
    if (!userRes.rowCount) throw new ApiError(404, 'User not found.');
    const user = userRes.rows[0];

    const checkout = createCheckout(user);

    // Live providers return a checkoutUrl and confirm via webhook. The stub
    // auto-confirms so the demo flow activates immediately.
    if (checkout.autoConfirm) {
      const updated = await query(
        'UPDATE users SET subscribed = TRUE WHERE id = $1 RETURNING *',
        [user.id]
      );
      return res.json({ status: 'active', checkout, user: serializeUser(updated.rows[0]) });
    }
    res.json({ status: 'pending', checkout });
  })
);

// POST /api/billing/webhook  — payment provider calls this on success.
// No user auth (the provider calls it); the payload is signature-verified instead.
router.post(
  '/webhook',
  asyncHandler(async (req, res) => {
    const verdict = verifyWebhook(req.headers, req.body);
    if (!verdict.ok) throw new ApiError(400, 'Invalid webhook signature.');

    // The provider tells us which account paid. Stub accepts an email.
    const email = String(req.body.email || '').trim().toLowerCase();
    if (email) {
      await query('UPDATE users SET subscribed = TRUE WHERE email = $1', [email]);
    }
    res.json({ ok: true });
  })
);

module.exports = router;
