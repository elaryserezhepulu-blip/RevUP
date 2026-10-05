'use strict';

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config/env');
const { pool } = require('./db/pool');
const publicRoutes = require('./routes/public.routes');
const { notFound, errorHandler } = require('./middleware/error');

const authRoutes = require('./routes/auth.routes');
const storesRoutes = require('./routes/stores.routes');
const salesRoutes = require('./routes/sales.routes');
const reportsRoutes = require('./routes/reports.routes');
const billingRoutes = require('./routes/billing.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// CSP is disabled so the served frontend's inline styles, Google Fonts, and
// data: SVG icons work. Tighten this (a proper CSP) before production.
app.use(helmet({ contentSecurityPolicy: false }));
const corsOrigin =
  config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((s) => s.trim());
app.use(cors({ origin: corsOrigin }));
// CSV payloads can be sizable — allow a generous JSON body.
app.use(express.json({ limit: '15mb' }));
if (!config.isProd) app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'revup-backend' }));
app.get('/api/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1 FROM users LIMIT 1');
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/stores', storesRoutes);
// Nested under a specific store (mergeParams exposes :id).
app.use('/api/stores/:id/sales', salesRoutes);
app.use('/api/stores/:id/reports', reportsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve the connected frontend (backend/public). Same-origin = no CORS issues.
// API routes are registered above, so they take precedence over static files.
app.use(publicRoutes);
app.use(express.static(path.join(__dirname, '..', 'public'), { index: false }));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
