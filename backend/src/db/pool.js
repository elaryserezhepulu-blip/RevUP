'use strict';

const { Pool } = require('pg');
const config = require('../config/env');

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  // A pooled client errored while idle — log but don't crash the process.
  console.error('[db] unexpected idle client error:', err.message);
});

/** Run a single parameterized query. */
function query(text, params) {
  return pool.query(text, params);
}

/** Run fn inside a transaction, committing on success and rolling back on error. */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
