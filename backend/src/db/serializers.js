'use strict';

// Shape DB rows into safe API responses. Secrets (password_hash, api_key_enc)
// are never included.

function serializeUser(row) {
  return {
    id: row.id,
    business: row.business,
    email: row.email,
    subscribed: row.subscribed,
    reportsUsed: row.reports_used,
    createdAt: row.created_at,
  };
}

// `salesCount` is passed in from a COUNT query (default 0).
function serializeStore(row, salesCount = 0) {
  const count = Number(salesCount) || 0;
  let source = null;
  let connection = null;
  if (row.source_type === 'csv') {
    source = { type: 'csv', filename: row.source_filename, count: row.source_count };
  } else if (row.source_type === 'api') {
    connection = {
      provider: row.provider,
      merchantId: row.merchant_id || '',
      connectedAt: row.connected_at,
      lastSync: row.last_sync,
    };
  }
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    source,
    connection, // note: never includes the API key
    hasData: row.source_type !== 'none' && count > 0,
    salesCount: count,
    createdAt: row.created_at,
  };
}

module.exports = { serializeUser, serializeStore };
