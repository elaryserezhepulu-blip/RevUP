'use strict';

// Applies schema.sql to the configured database. Idempotent — safe to re-run.
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  console.log('[migrate] applying schema...');
  await pool.query(sql);
  console.log('[migrate] done.');
}

migrate()
  .then(() => pool.end())
  .catch((err) => {
    console.error('[migrate] failed:', err.message);
    pool.end().finally(() => process.exit(1));
  });
