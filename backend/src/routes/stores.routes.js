'use strict';

const express = require('express');
const { query } = require('../db/pool');
const { getOwnedStore, getSalesCount } = require('../db/queries');
const { serializeStore } = require('../db/serializers');
const { ApiError, asyncHandler } = require('../middleware/error');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/stores  — all stores for the signed-in user, with sales counts.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT s.*, COUNT(sa.id)::int AS sales_count
         FROM stores s
         LEFT JOIN sales sa ON sa.store_id = s.id
        WHERE s.user_id = $1
        GROUP BY s.id
        ORDER BY s.created_at ASC`,
      [req.auth.userId]
    );
    res.json({ stores: result.rows.map((r) => serializeStore(r, r.sales_count)) });
  })
);

// POST /api/stores  — add a store (starts empty, like the prototype).
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || '').trim();
    const location = String(req.body.location || '').trim() || null;
    if (!name) throw new ApiError(400, 'Store name is required.');

    const result = await query(
      `INSERT INTO stores (user_id, name, location) VALUES ($1, $2, $3) RETURNING *`,
      [req.auth.userId, name, location]
    );
    res.status(201).json({ store: serializeStore(result.rows[0], 0) });
  })
);

// GET /api/stores/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const store = await getOwnedStore(req.params.id, req.auth.userId);
    if (!store) throw new ApiError(404, 'Store not found.');
    const count = await getSalesCount(store.id);
    res.json({ store: serializeStore(store, count) });
  })
);

// PATCH /api/stores/:id  — rename / relocate.
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const store = await getOwnedStore(req.params.id, req.auth.userId);
    if (!store) throw new ApiError(404, 'Store not found.');

    const name = req.body.name !== undefined ? String(req.body.name).trim() : store.name;
    const location =
      req.body.location !== undefined ? String(req.body.location).trim() || null : store.location;
    if (!name) throw new ApiError(400, 'Store name cannot be empty.');

    const result = await query(
      `UPDATE stores SET name = $1, location = $2 WHERE id = $3 RETURNING *`,
      [name, location, store.id]
    );
    const count = await getSalesCount(store.id);
    res.json({ store: serializeStore(result.rows[0], count) });
  })
);

// DELETE /api/stores/:id  — removes the store and its sales/reports (cascade).
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await query(
      'DELETE FROM stores WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.auth.userId]
    );
    if (!result.rowCount) throw new ApiError(404, 'Store not found.');
    res.json({ ok: true });
  })
);

module.exports = router;
