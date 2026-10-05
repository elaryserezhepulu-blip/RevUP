'use strict';

// Subscription / payment boundary.
//
// The live product charges ₸40,000/year via Kaspi (or card) and activates the
// subscription on a verified payment webhook. We don't have a payment provider
// account yet, so this module exposes the shape the routes need and a stubbed
// checkout that the demo "subscribe" button can complete immediately.
//
// To go live:
//   1. createCheckout() should call the payment provider and return a real
//      redirect/deeplink URL plus a provider reference id.
//   2. The provider calls POST /api/billing/webhook on payment success; verify
//      the signature there, then flip the user's `subscribed` flag.

const config = require('../config/env');
const { ApiError } = require('../middleware/error');

function createCheckout(user) {
  if (config.isProd) throw new ApiError(503, 'Online payments are not available yet.');
  // Stub: pretend we created a payment session.
  const reference = 'stub_' + Date.now();
  return {
    provider: 'stub',
    reference,
    amountKzt: config.subscriptionPriceKzt,
    // In production this is the provider's hosted-payment URL.
    checkoutUrl: null,
    // Whether the frontend may immediately confirm (demo) or must wait for a webhook (live).
    autoConfirm: true,
  };
}

// Verify a provider webhook payload. Stub always "verifies".
function verifyWebhook(/* headers, rawBody */) {
  return { ok: !config.isProd };
}

module.exports = { createCheckout, verifyWebhook };
