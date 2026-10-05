'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
process.env.NODE_ENV = 'production';
process.env.DATABASE_URL = 'postgres://test:test@127.0.0.1:1/test';
process.env.JWT_SECRET = 'deployment-test-only-not-a-real-secret';
process.env.PUBLIC_SITE_URL = 'https://revup.example';
process.env.GOOGLE_SITE_VERIFICATION = 'test-token';
const app = require('./app');
const { pool } = require('./db/pool');
const payments = require('./services/payment');
const server = app.listen(0, '127.0.0.1');
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});
async function request(url, options) {
  if (!server.listening) await new Promise((resolve) => server.once('listening', resolve));
  return fetch(`http://127.0.0.1:${server.address().port}${url}`, options);
}
test('homepage has crawlable content and the configured canonical address', async () => {
  const response = await request('/');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<h1>RevUp: smart reordering/);
  assert.match(html, /rel="canonical" href="https:\/\/revup.example\/"/);
  assert.match(html, /google-site-verification" content="test-token"/);
  assert.doesNotMatch(html, /noindex/);
});
test('crawler endpoints use the configured address, not the incoming Host', async () => {
  const response = await request('/robots.txt', { headers: { Host: 'untrusted.example' } });
  assert.match(await response.text(), /Sitemap: https:\/\/revup.example\/sitemap.xml/);
  const sitemap = await request('/sitemap.xml');
  assert.equal(sitemap.status, 200);
  assert.match(await sitemap.text(), /<loc>https:\/\/revup.example\/<\/loc>/);
});
test('index.html redirects and missing pages remain 404', async () => {
  const response = await request('/index.html', { redirect: 'manual' });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), '/');
  assert.equal((await request('/missing-page')).status, 404);
});
test('production cannot activate fake payments or use sample POS data', async () => {
  assert.throws(() => payments.createCheckout({}), { status: 503 });
  assert.equal(payments.verifyWebhook().ok, false);
  assert.equal(require('./config/env').stubPos, false);
  const response = await request('/api/billing/webhook', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'anyone@example.com' }),
  });
  assert.equal(response.status, 400);
});
test('readiness fails when the database is unavailable', async () => {
  assert.equal((await request('/api/ready')).status, 503);
});
