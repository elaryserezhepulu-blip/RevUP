'use strict';

const { query } = require('./pool');

// Load a store only if it belongs to the given user. Returns the row or null.
async function getOwnedStore(storeId, userId) {
  const result = await query('SELECT * FROM stores WHERE id = $1 AND user_id = $2', [storeId, userId]);
  return result.rows[0] || null;
}

async function getSalesCount(storeId) {
  const result = await query('SELECT COUNT(*)::int AS n FROM sales WHERE store_id = $1', [storeId]);
  return result.rows[0].n;
}

// Sales rows in the shape the analytics engine expects.
// sale_date is returned as 'YYYY-MM-DD' or 'n/a'.
async function getStoreSales(storeId) {
  const result = await query(
    `SELECT to_char(sale_date, 'YYYY-MM-DD') AS date,
            product,
            quantity::float8 AS quantity,
            price::float8    AS price,
            stock::float8    AS stock,
            shelf_life       AS "shelfLife"
       FROM sales
      WHERE store_id = $1`,
    [storeId]
  );
  return result.rows.map((r) => ({
    date: r.date || 'n/a',
    product: r.product,
    quantity: r.quantity,
    price: r.price,
    stock: r.stock,
    shelfLife: r.shelfLife,
  }));
}

// Replace ALL sales for a store with a new set, inside the given transaction client.
// `sales` rows: { date: 'YYYY-MM-DD'|'n/a', product, quantity, price, stock, shelfLife }.
async function replaceSales(client, storeId, sales) {
  await client.query('DELETE FROM sales WHERE store_id = $1', [storeId]);
  const CHUNK = 500; // keep well under Postgres' parameter limit (7 params/row)
  for (let i = 0; i < sales.length; i += CHUNK) {
    const chunk = sales.slice(i, i + CHUNK);
    const values = [];
    const params = [];
    chunk.forEach((s, j) => {
      const b = j * 7;
      values.push(`($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7})`);
      params.push(
        storeId,
        s.date && s.date !== 'n/a' ? s.date : null,
        s.product,
        s.quantity,
        s.price || 0,
        s.stock || 0,
        s.shelfLife != null ? s.shelfLife : null
      );
    });
    await client.query(
      `INSERT INTO sales (store_id, sale_date, product, quantity, price, stock, shelf_life)
       VALUES ${values.join(',')}`,
      params
    );
  }
}

module.exports = { getOwnedStore, getSalesCount, getStoreSales, replaceSales };
