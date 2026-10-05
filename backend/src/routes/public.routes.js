'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');
const router = express.Router();
const template = fs.readFileSync(path.join(__dirname, '../../public/index.html'), 'utf8');
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const rawUrl = process.env.PUBLIC_SITE_URL || process.env.RENDER_EXTERNAL_URL;
let origin = '';
if (rawUrl) {
  const url = new URL(rawUrl);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      (config.isProd && url.protocol !== 'https:')) {
    throw new Error('PUBLIC_SITE_URL must be a public HTTPS address in production.');
  }
  origin = url.origin;
}
router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(origin
    ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n');
});
router.get('/sitemap.xml', (req, res) => {
  if (!origin) return res.status(503).type('text/plain').send('Public address is not configured.');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(origin)}/</loc></url></urlset>`);
});
router.get('/index.html', (req, res) => res.redirect(301, '/'));
router.get('/', (req, res) => {
  const tags = [];
  if (origin) tags.push(`<link rel="canonical" href="${escape(origin)}/"><meta property="og:url" content="${escape(origin)}/">`);
  else tags.push('<meta name="robots" content="noindex, nofollow">');
  for (const [name, value] of [
    ['google-site-verification', process.env.GOOGLE_SITE_VERIFICATION],
    ['yandex-verification', process.env.YANDEX_SITE_VERIFICATION],
  ]) {
    if (value) tags.push(`<meta name="${name}" content="${escape(value)}">`);
  }
  res.type('html').send(template.replace('</head>', `${tags.join('\n')}</head>`));
});
module.exports = router;
