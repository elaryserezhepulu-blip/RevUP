'use strict';

const express = require('express');
const { query, withTransaction } = require('../db/pool');
const { getOwnedStore, getSalesCount, replaceSales } = require('../db/queries');
const { serializeStore } = require('../db/serializers');
const { parseCSV, detectColumns, mapRowsToSales } = require('../utils/csv');
const { encrypt, decrypt } = require('../utils/crypto');
const { PROVIDERS, fetchSalesFromPOS } = require('../services/pos');
const { ApiError, asyncHandler } = require('../middleware/error');
const { requireAuth } = require('../middleware/auth');

// mergeParams so :id from the parent mount is available here.
const router = express.Router({ mergeParams: true });
router.use(requireAuth);

async function loadStore(req) {
  const store = await getOwnedStore(req.params.id, req.auth.userId);
  if (!store) throw new ApiError(404, 'Store not found.');
  return store;
}

// POST /api/stores/:id/sales/detect
// Body: { csv }  → returns detected columns + a small sample so the UI can
// confirm the mapping (mirrors the prototype's two-step upload).
router.post(
  '/detect',
  asyncHandler(async (req, res) => {
    await loadStore(req);
    const { fields, rows } = parseCSV(req.body.csv || '');
    if (!fields.length || !rows.length) throw new ApiError(400, 'That file looks empty.');
    res.json({
      fields,
      suggested: detectColumns(fields),
      sample: rows.slice(0, 5),
      rowCount: rows.length,
    });
  })
);

// POST /api/stores/:id/sales/csv
// Body: { csv, filename?, mapping? } → replaces the store's sales from a CSV.
// If mapping is omitted, columns are auto-detected.
router.post(
  '/csv',
  asyncHandler(async (req, res) => {
    const store = await loadStore(req);
    const { fields, rows } = parseCSV(req.body.csv || '');
    if (!fields.length || !rows.length) throw new ApiError(400, 'That file looks empty.');

    const mapping = req.body.mapping || detectColumns(fields);
    if (!mapping.product || !mapping.quantity) {
      throw new ApiError(400, 'A Product column and a Quantity column are required.');
    }
    const mapped = mapRowsToSales(rows, mapping);
    if (!mapped.ok) throw new ApiError(400, mapped.error);

    const filename = String(req.body.filename || 'upload.csv');
    await withTransaction(async (client) => {
      await replaceSales(client, store.id, mapped.sales);
      await client.query(
        `UPDATE stores
            SET source_type = 'csv', source_filename = $1, source_count = $2,
                provider = NULL, api_key_enc = NULL, merchant_id = NULL,
                connected_at = NULL, last_sync = NULL
          WHERE id = $3`,
        [filename, mapped.sales.length, store.id]
      );
    });

    const updated = await getOwnedStore(store.id, req.auth.userId);
    res.json({ count: mapped.sales.length, store: serializeStore(updated, mapped.sales.length) });
  })
);

// POST /api/stores/:id/sales/connect
// Body: { provider, apiKey, merchantId? } → stores the POS connection (key
// encrypted at rest) and immediately syncs.
router.post(
  '/connect',
  asyncHandler(async (req, res) => {
    const store = await loadStore(req);
    const provider = String(req.body.provider || '').trim();
    const apiKey = String(req.body.apiKey || '').trim();
    const merchantId = String(req.body.merchantId || '').trim() || null;

    if (!PROVIDERS.includes(provider)) {
      throw new ApiError(400, `Unknown provider. One of: ${PROVIDERS.join(', ')}.`);
    }
    if (!apiKey) throw new ApiError(400, 'Please provide your POS API key.');

    await query(
      `UPDATE stores
          SET source_type = 'api', provider = $1, api_key_enc = $2, merchant_id = $3,
              connected_at = now(), source_filename = NULL, source_count = NULL
        WHERE id = $4`,
      [provider, encrypt(apiKey), merchantId, store.id]
    );

    const synced = await doSync(store.id, { provider, apiKey, merchantId });
    const updated = await getOwnedStore(store.id, req.auth.userId);
    res.json({ count: synced, store: serializeStore(updated, synced) });
  })
);

// POST /api/stores/:id/sales/sync  — re-pull from the connected POS.
router.post(
  '/sync',
  asyncHandler(async (req, res) => {
    const store = await loadStore(req);
    if (store.source_type !== 'api' || !store.api_key_enc) {
      throw new ApiError(400, 'This store is not connected to a cash register.');
    }
    const connection = {
      provider: store.provider,
      apiKey: decrypt(store.api_key_enc),
      merchantId: store.merchant_id,
    };
    const synced = await doSync(store.id, connection);
    const updated = await getOwnedStore(store.id, req.auth.userId);
    res.json({ count: synced, store: serializeStore(updated, synced) });
  })
);

// Pull from the POS provider and replace the store's sales. Returns row count.
async function doSync(storeId, connection) {
  const sales = await fetchSalesFromPOS(connection);
  await withTransaction(async (client) => {
    await replaceSales(client, storeId, sales);
    await client.query(`UPDATE stores SET last_sync = now() WHERE id = $1`, [storeId]);
  });
  return sales.length;
}

// DELETE /api/stores/:id/sales  — clear data + disconnect (history reports kept).
router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const store = await loadStore(req);
    await withTransaction(async (client) => {
      await client.query('DELETE FROM sales WHERE store_id = $1', [store.id]);
      await client.query(
        `UPDATE stores
            SET source_type = 'none', source_filename = NULL, source_count = NULL,
                provider = NULL, api_key_enc = NULL, merchant_id = NULL,
                connected_at = NULL, last_sync = NULL
          WHERE id = $1`,
        [store.id]
      );
    });
    const updated = await getOwnedStore(store.id, req.auth.userId);
    res.json({ store: serializeStore(updated, 0) });
  })
);

module.exports = router;
