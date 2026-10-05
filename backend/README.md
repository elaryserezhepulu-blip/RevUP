# RevUp Backend

API for **RevUp** — smart reordering for retail (Kazakhstan). Replaces the prototype's
`localStorage` with real accounts, persistent storage, server-side reports, signup
email notifications, and integration boundaries for POS sync and payments.

- **Stack:** Node.js + Express (plain JS), PostgreSQL
- **Auth:** email + password (bcrypt-hashed), JWT bearer tokens
- **Analytics:** the prototype's `analyze()` ported 1:1 — reports come out identical

---

## 1. Prerequisites

- Node.js 18+ (you have v24)
- A PostgreSQL database. Pick one:
  - **Docker (easiest):** `docker compose up -d` — gives you Postgres on `localhost:5432`
  - **Hosted free tier:** [Neon](https://neon.tech) or [Supabase](https://supabase.com) — copy their connection string (add `DATABASE_SSL=true`)
  - **Local install:** [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)

## 2. Setup

```bash
cd backend
npm install
cp .env.example .env        # then edit .env (set DATABASE_URL, JWT_SECRET)
npm run migrate             # create tables
npm run seed                # optional: demo account with sample data
npm run dev                 # start with auto-reload (or: npm start)
```

Health check: open <http://localhost:4000/api/health> → `{ "ok": true }`.

Demo login after `npm run seed`: `demo@revup.kz` / `demo123` (subscribed, 1 store, ~3650 sample rows).

## 3. Environment variables

See [.env.example](.env.example). The important ones:

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (required) |
| `DATABASE_SSL` | `true` for most hosted Postgres |
| `JWT_SECRET` | Signs auth tokens (required in production) |
| `APP_ENCRYPTION_KEY` | Encrypts POS API keys at rest |
| `STUB_POS` | `true` → POS sync returns sample data (no real provider needed yet) |
| `SMTP_*` / `OWNER_NOTIFICATION_EMAIL` | Signup email; if SMTP is blank it logs to console |
| `SUBSCRIPTION_PRICE_KZT` / `FREE_REPORTS` | Paywall: ₸40,000 / 1 free report |

## 4. API reference

All responses are JSON. Protected routes need `Authorization: Bearer <token>`.

### Auth
| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | `{ business, email, password }` | Creates user + a default "Main Store"; sends signup email; returns `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` |
| GET | `/api/auth/me` | — | `{ user }` |

### Stores
| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| GET | `/api/stores` | — | `{ stores: [...] }` with `hasData`, `salesCount` |
| POST | `/api/stores` | `{ name, location? }` | Create (starts empty) |
| GET | `/api/stores/:id` | — | One store |
| PATCH | `/api/stores/:id` | `{ name?, location? }` | Rename / relocate |
| DELETE | `/api/stores/:id` | — | Remove store + its data |

### Sales (data sources)
| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| POST | `/api/stores/:id/sales/detect` | `{ csv }` | Returns detected columns + sample for mapping confirmation |
| POST | `/api/stores/:id/sales/csv` | `{ csv, filename?, mapping? }` | Replaces sales from CSV (any column names; auto-detected if no mapping) |
| POST | `/api/stores/:id/sales/connect` | `{ provider, apiKey, merchantId? }` | Stores POS connection (key encrypted) and syncs |
| POST | `/api/stores/:id/sales/sync` | — | Re-pull from the connected POS |
| DELETE | `/api/stores/:id/sales` | — | Clear data + disconnect |

### Reports
| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| POST | `/api/stores/:id/reports` | `{ period }` | `period` ∈ {7,30,365}. Enforces free-report limit → `402` with `{paywall:true}` |
| GET | `/api/stores/:id/reports` | — | History summaries (newest first) |
| GET | `/api/stores/:id/reports/:reportId` | — | Full saved report |

### Billing
| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| GET | `/api/billing/plan` | — | `{ priceKzt, freeReports, period }` |
| POST | `/api/billing/subscribe` | — | Stub auto-activates; returns updated `user` |
| POST | `/api/billing/webhook` | provider payload | Activates on verified payment (stubbed) |

## 5. What's real vs. stubbed

Real now: auth, persistence, CSV ingest, server-side reports + history, paywall gating,
signup email (when SMTP configured), POS API-key encryption.

Stubbed behind clean interfaces (need credentials/docs to finish): POS provider clients
(`src/services/pos.js`) and payment provider (`src/services/payment.js`). See
[backend_plan.md](backend_plan.md).

## 6. Connecting the frontend

The prototype (`../RevUp (1).html`) currently reads/writes `localStorage`. To use this
API, replace those calls with `fetch` to the endpoints above and store the JWT. The
report data shapes are unchanged, so the rendering code stays as-is. See the "Frontend
wiring" section of [backend_plan.md](backend_plan.md).
