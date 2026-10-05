-- RevUp backend schema. Safe to run repeatedly (idempotent).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---- Users (store owners) ----
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business      TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  subscribed    BOOLEAN NOT NULL DEFAULT FALSE,
  reports_used  INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- Stores ----
-- A store's data source is one of: 'none' | 'csv' | 'api'.
-- POS API keys are stored encrypted at rest (api_key_enc), never in plaintext.
CREATE TABLE IF NOT EXISTS stores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  location        TEXT,
  source_type     TEXT NOT NULL DEFAULT 'none',
  source_filename TEXT,
  source_count    INTEGER,
  provider        TEXT,
  api_key_enc     TEXT,
  merchant_id     TEXT,
  connected_at    TIMESTAMPTZ,
  last_sync       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stores_user ON stores(user_id);

-- ---- Sales rows ----
CREATE TABLE IF NOT EXISTS sales (
  id         BIGSERIAL PRIMARY KEY,
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  sale_date  DATE,
  product    TEXT NOT NULL,
  quantity   NUMERIC NOT NULL,
  price      NUMERIC NOT NULL DEFAULT 0,
  stock      NUMERIC NOT NULL DEFAULT 0,
  shelf_life INTEGER
);
CREATE INDEX IF NOT EXISTS idx_sales_store ON sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_store_product ON sales(store_id, product);

-- ---- Saved reports (snapshot of analytics output) ----
CREATE TABLE IF NOT EXISTS reports (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  period     INTEGER NOT NULL,
  data       JSONB NOT NULL,
  series     JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_store ON reports(store_id, created_at DESC);
