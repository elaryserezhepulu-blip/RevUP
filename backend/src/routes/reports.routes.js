'use strict';

const express = require('express');
const { query } = require('../db/pool');
const { getOwnedStore, getSalesCount, getStoreSales } = require('../db/queries');
const { serializeUser } = require('../db/serializers');
const { analyze, salesSeries } = require('../utils/analytics');
const { ApiError, asyncHandler } = require('../middleware/error');
const { requireAuth } = require('../middleware/auth');
const config = require('../config/env');

const router = express.Router({ mergeParams: true });
router.use(requireAuth);

const ALLOWED_PERIODS = [7, 30, 365];
const BUCKETS = 12; // line-chart resolution, matches the prototype
const MAX_HISTORY = 20;

async function loadStore(req) {
  const store = await getOwnedStore(req.params.id, req.auth.userId);
  if (!store) throw new ApiError(404, 'Store not found.');
  return store;
}

// POST /api/stores/:id/reports   Body: { period }
// Generates and saves a report. Enforces the free-report limit for non-subscribers.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const store = await loadStore(req);
    const period = Number(req.body.period || 30);
    if (!ALLOWED_PERIODS.includes(period)) {
      throw new ApiError(400, `period must be one of ${ALLOWED_PERIODS.join(', ')}.`);
    }

    const count = await getSalesCount(store.id);
    if (store.source_type === 'none' || count === 0) {
      throw new ApiError(400, 'Upload a file or connect a cash register first.');
    }

    // Paywall gating (mirrors the prototype's takeReport).
    const userRes = await query('SELECT * FROM users WHERE id = $1', [req.auth.userId]);
    let user = userRes.rows[0];
    if (!user.subscribed) {
      if (user.reports_used >= config.freeReports) {
        throw new ApiError(402, 'Your free report is used. Subscribe to generate more.', {
          paywall: true,
          priceKzt: config.subscriptionPriceKzt,
        });
      }
      const inc = await query(
        'UPDATE users SET reports_used = reports_used + 1 WHERE id = $1 RETURNING *',
        [user.id]
      );
      user = inc.rows[0];
    }

    const sales = await getStoreSales(store.id);
    const data = analyze(sales, period);
    const series = salesSeries(sales, period, BUCKETS);

    const inserted = await query(
      `INSERT INTO reports (store_id, period, data, series)
       VALUES ($1, $2, $3, $4) RETURNING id, period, created_at`,
      [store.id, period, JSON.stringify(data), JSON.stringify(series)]
    );

    // Keep only the most recent MAX_HISTORY reports per store.
    await query(
      `DELETE FROM reports
        WHERE store_id = $1
          AND id NOT IN (
            SELECT id FROM reports WHERE store_id = $1
             ORDER BY created_at DESC LIMIT $2
          )`,
      [store.id, MAX_HISTORY]
    );

    const row = inserted.rows[0];
    res.status(201).json({
      report: { id: row.id, period: row.period, createdAt: row.created_at, data, series },
      user: serializeUser(user),
    });
  })
);

// GET /api/stores/:id/reports  — history (summaries, newest first).
router.get(
  '/',
  asyncHandler(async (req, res) => {
    await loadStore(req);
    const result = await query(
      `SELECT id, period, created_at,
              (data->>'totalRevenue')::float8 AS total_revenue,
              (data->>'totalUnits')::float8   AS total_units
         FROM reports
        WHERE store_id = $1
        ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json({
      reports: result.rows.map((r) => ({
        id: r.id,
        period: r.period,
        createdAt: r.created_at,
        totalRevenue: r.total_revenue,
        totalUnits: r.total_units,
      })),
    });
  })
);

// GET /api/stores/:id/reports/:reportId  — full saved report.
router.get(
  '/:reportId',
  asyncHandler(async (req, res) => {
    await loadStore(req);
    const result = await query(
      `SELECT id, period, created_at, data, series
         FROM reports WHERE id = $1 AND store_id = $2`,
      [req.params.reportId, req.params.id]
    );
    if (!result.rowCount) throw new ApiError(404, 'Report not found.');
    const r = result.rows[0];
    res.json({
      report: { id: r.id, period: r.period, createdAt: r.created_at, data: r.data, series: r.series },
    });
  })
);

module.exports = router;
