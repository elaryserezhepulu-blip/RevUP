'use strict';

// Ported from the RevUp prototype's CSV handling. Lets RevUp read ANY format:
// columns are auto-detected, and the caller can override the mapping.

function numOrNull(v) {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? null : n;
}

function detectColumns(fields) {
  const used = new Set();
  // Tries candidates in priority order; claims the most specific column first.
  const pick = (cands) => {
    for (const c of cands) {
      const f = fields.find((fl) => !used.has(fl) && fl.toLowerCase().includes(c));
      if (f) {
        used.add(f);
        return f;
      }
    }
    return undefined;
  };
  const product = pick(['product', 'товар', 'тауар', 'наимен', 'item', 'good', 'sku', 'name']);
  const quantity = pick([
    'quantity_sold', 'qty_sold', 'units_sold', 'sold', 'продан', 'сатыл',
    'quantity', 'qty', 'units', 'сан', 'колич', 'count',
  ]);
  const price = pick([
    'sale_price', 'sell_price', 'unit_sale', 'selling', 'retail', 'price', 'цена', 'баға', 'cost', 'стоим',
  ]);
  const date = pick(['sale_date', 'sold_date', 'sell_date', 'сатыл', 'дата', 'date', 'day', 'time', 'күн']);
  const stock = pick(['remaining', 'on_hand', 'onhand', 'on hand', 'stock', 'остат', 'қалд', 'inventory', 'balance', 'нали']);
  const shelf = pick(['shelf', 'expiry', 'expire', 'срок', 'жарам', 'life']);
  return { product, quantity, price, date, stock, shelf };
}

function parseCSV(text) {
  text = String(text).replace(/^﻿/, '');
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length);
  if (!lines.length) return { fields: [], rows: [] };
  const parseLine = (line) => {
    const out = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else q = false;
        } else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ',') {
        out.push(cur);
        cur = '';
      } else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const fields = parseLine(lines[0]).map((f) => f.trim());
  const rows = lines.slice(1).map((l) => {
    const cells = parseLine(l);
    const o = {};
    fields.forEach((f, i) => (o[f] = cells[i]));
    return o;
  });
  return { fields, rows };
}

// Turn raw CSV rows into sales rows using a confirmed column mapping.
// Returns { ok, sales } or { ok: false, error }.
function mapRowsToSales(rows, map) {
  const sales = rows
    .map((r) => ({
      date: map.date ? String(r[map.date]).slice(0, 10) : 'n/a',
      product: r[map.product],
      quantity: numOrNull(r[map.quantity]),
      price: map.price ? numOrNull(r[map.price]) || 0 : 0,
      stock: map.stock ? numOrNull(r[map.stock]) || 0 : 0,
      shelfLife: map.shelf ? numOrNull(r[map.shelf]) : null,
    }))
    .filter((r) => r.product && r.quantity != null);
  if (!sales.length) return { ok: false, error: 'No usable rows for the chosen columns.' };
  return { ok: true, sales };
}

module.exports = { numOrNull, detectColumns, parseCSV, mapRowsToSales };
