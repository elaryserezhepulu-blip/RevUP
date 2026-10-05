'use strict';

const express = require('express');
const { query } = require('../db/pool');
const { getStoreSales } = require('../db/queries');
const { serializeStore } = require('../db/serializers');
const { analyze, salesSeries } = require('../utils/analytics');
const { asyncHandler } = require('../middleware/error');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const BUCKETS = 12;
const ALLOWED = [7, 30, 365];

// GET /api/dashboard?period=30
// Cross-store summary for the dashboard + store cards. NOT gated and NOT saved —
// these are the free at-a-glance numbers the prototype shows for every store.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const period = ALLOWED.includes(Number(req.query.period)) ? Number(req.query.period) : 30;

    const storesRes = await query(
      `SELECT s.*, COUNT(sa.id)::int AS sales_count
         FROM stores s
         LEFT JOIN sales sa ON sa.store_id = s.id
        WHERE s.user_id = $1
        GROUP BY s.id
        ORDER BY s.created_at ASC`,
      [req.auth.userId]
    );

    const combined = Array(BUCKETS).fill(0);
    let totalRevenue = 0;
    let totalUnits = 0;
    let orderValue = 0;
    const stores = [];

    for (const row of storesRes.rows) {
      const base = serializeStore(row, row.sales_count);
      let revenue = 0;
      let units = 0;
      if (base.hasData) {
        const sales = await getStoreSales(row.id);
        const a = analyze(sales, period);
        revenue = a.totalRevenue;
        units = a.totalUnits;
        orderValue += a.orderValue;
        salesSeries(sales, period, BUCKETS).forEach((v, i) => (combined[i] += v));
      }
      totalRevenue += revenue;
      totalUnits += units;
      stores.push({ ...base, revenue, units });
    }

    res.json({
      period,
      totals: { revenue: totalRevenue, units: totalUnits, storeCount: storesRes.rowCount, orderValue },
      series: combined,
      stores,
    });
  })
);

module.exports = router;
