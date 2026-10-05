'use strict';

// Optional: create a demo account with one store full of sample sales so you can
// click "Take report" right away. Safe to re-run (resets the demo store's sales).
//   npm run seed
const { pool, withTransaction } = require('./pool');
const { hashPassword } = require('../utils/password');
const { replaceSales } = require('./queries');
const { generateSales } = require('../services/pos');

const DEMO_EMAIL = 'demo@revup.kz';
const DEMO_PASSWORD = 'demo123';

async function seed() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const sales = generateSales(42);

  await withTransaction(async (client) => {
    // Upsert the demo user.
    const u = await client.query(
      `INSERT INTO users (business, email, password_hash, subscribed)
         VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (email) DO UPDATE SET business = EXCLUDED.business
       RETURNING id`,
      ['Demo Market LLP', DEMO_EMAIL, passwordHash]
    );
    const userId = u.rows[0].id;

    // Ensure exactly one demo store with sample data.
    let s = await client.query('SELECT id FROM stores WHERE user_id = $1 ORDER BY created_at LIMIT 1', [userId]);
    let storeId;
    if (s.rowCount) {
      storeId = s.rows[0].id;
    } else {
      const ins = await client.query(
        `INSERT INTO stores (user_id, name, location) VALUES ($1, $2, $3) RETURNING id`,
        [userId, 'Main Store', 'Astana']
      );
      storeId = ins.rows[0].id;
    }

    await replaceSales(client, storeId, sales);
    await client.query(
      `UPDATE stores
          SET source_type = 'csv', source_filename = 'sample.csv', source_count = $1
        WHERE id = $2`,
      [sales.length, storeId]
    );
  });

  console.log('[seed] done.');
  console.log(`[seed] login: ${DEMO_EMAIL} / ${DEMO_PASSWORD} (subscribed, 1 store, ${sales.length} sample rows)`);
}

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error('[seed] failed:', err.message);
    pool.end().finally(() => process.exit(1));
  });
