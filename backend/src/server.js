'use strict';

const app = require('./app');
const config = require('./config/env');
const { pool } = require('./db/pool');

async function start() {
  // Fail fast if the database is unreachable.
  try {
    await pool.query('SELECT 1');
    console.log('[server] database connection OK');
  } catch (err) {
    console.error('[server] cannot reach the database:', err.message);
    console.error('[server] check DATABASE_URL and that Postgres is running.');
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`[server] RevUp backend listening on http://localhost:${config.port} (${config.env})`);
  });

  const shutdown = (sig) => {
    console.log(`[server] ${sig} received, shutting down...`);
    server.close(() => pool.end().finally(() => process.exit(0)));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
