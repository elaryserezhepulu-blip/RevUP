'use strict';

// POS (cash register) integration boundary.
//
// In the live product, fetchSalesFromPOS() takes the store's decrypted API key,
// calls the provider's API (Kaspi / Webkassa / SYNTERRA / X2 POS / 1C), and returns
// real sales rows. We don't have provider credentials/docs yet, so when STUB_POS=true
// this returns generated sample data so the whole sync flow works end-to-end.
//
// To wire a real provider: implement a function with the signature
//   async (connection) => [{ date, product, quantity, price, stock, shelfLife }, ...]
// and register it in PROVIDER_CLIENTS below.

const config = require('../config/env');

const PROVIDERS = ['Kaspi', 'Webkassa', 'SYNTERRA', 'X2 POS', '1C', 'Other'];

// ---- sample-data generator (ported from the prototype) ----
function rng(seed) {
  let s = seed || 1;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const PRODUCTS = [
  { name: 'Milk 1L', base: 22, wknd: 1.3, trend: 0.01, sh: 5, noise: 0.18, stock: 30, price: 450 },
  { name: 'White bread', base: 30, wknd: 1.2, trend: 0.0, sh: 3, noise: 0.15, stock: 20, price: 220 },
  { name: 'Eggs (dozen)', base: 14, wknd: 1.4, trend: 0.02, sh: 21, noise: 0.2, stock: 18, price: 1100 },
  { name: 'Bananas (kg)', base: 18, wknd: 1.1, trend: -0.018, sh: 6, noise: 0.22, stock: 40, price: 750 },
  { name: 'Coca-Cola 1L', base: 16, wknd: 1.6, trend: 0.014, sh: 0, noise: 0.25, stock: 25, price: 600 },
  { name: 'Yogurt cup', base: 12, wknd: 1.2, trend: -0.022, sh: 10, noise: 0.2, stock: 60, price: 320 },
  { name: 'Chocolate bar', base: 9, wknd: 1.5, trend: 0.008, sh: 0, noise: 0.3, stock: 15, price: 480 },
  { name: 'Bottled water 5L', base: 7, wknd: 1.1, trend: 0.006, sh: 0, noise: 0.2, stock: 12, price: 540 },
  { name: 'Dishwashing liquid', base: 3, wknd: 1.0, trend: -0.004, sh: 0, noise: 0.4, stock: 22, price: 890 },
  { name: 'Shampoo 400ml', base: 2, wknd: 1.0, trend: -0.03, sh: 0, noise: 0.5, stock: 30, price: 1450 },
];

function generateSales(seed) {
  const r = rng(seed);
  const days = 365;
  const start = new Date();
  start.setDate(start.getDate() - days);
  const rows = [];
  for (const p of PRODUCTS) {
    const baseAdj = p.base * (0.85 + r() * 0.4);
    for (let d = 0; d < days; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + d);
      const dow = date.getDay();
      const weekend = dow === 0 || dow === 6 ? p.wknd : 1;
      const noise = 1 + (r() - 0.5) * 2 * p.noise;
      const q = Math.max(0, Math.round((baseAdj + p.trend * d) * weekend * noise));
      rows.push({
        date: date.toISOString().slice(0, 10),
        product: p.name,
        quantity: q,
        price: p.price,
        shelfLife: p.sh || null,
        stock: p.stock,
      });
    }
  }
  return rows;
}

// Map of provider name -> real client. Empty until we have credentials/docs.
const PROVIDER_CLIENTS = {
  // Kaspi: async (connection) => [...],
  // Webkassa: async (connection) => [...],
};

// connection: { provider, apiKey, merchantId }
async function fetchSalesFromPOS(connection) {
  const client = PROVIDER_CLIENTS[connection.provider];
  if (client) return client(connection);

  if (config.stubPos) {
    // Deterministic-ish sample data so the sync flow is demonstrable.
    return generateSales(Math.floor(Math.random() * 99999));
  }

  const err = new Error(
    `No POS client implemented for "${connection.provider}". ` +
      'Set STUB_POS=true for sample data, or add a client in src/services/pos.js.'
  );
  err.status = 501;
  throw err;
}

module.exports = { PROVIDERS, fetchSalesFromPOS, generateSales };
