# RevUp — Backend Plan

This is the document the prototype's comments point to. It explains what the backend
does, what's built, and what still needs real credentials.

## Why a backend at all

The prototype (`RevUp (1).html`) is a complete front-end, but three things **cannot**
live in a static page:

1. **Secure accounts** — passwords must be hashed on a server, not stored in the browser.
2. **The live cash-register pull** — `fetchSalesFromPOS()` needs a secret API key and a
   server-to-server call to Kaspi/Webkassa/etc. A browser can't hold that key safely.
3. **Payments + email** — charging for Pro and emailing the owner on signup are
   server jobs.

## Architecture

```
backend/
  src/
    server.js            entrypoint (DB check, listen, graceful shutdown)
    app.js               express app, middleware, route mounting
    config/env.js        env loading + validation
    db/
      pool.js            pg pool + withTransaction()
      schema.sql         tables (users, stores, sales, reports)
      migrate.js         apply schema
      seed.js            demo account + sample data
      queries.js         shared queries (owned store, sales, bulk replace)
      serializers.js     row -> safe API shape (no secrets)
    middleware/
      auth.js            JWT bearer guard -> req.auth
      error.js           ApiError + asyncHandler + handlers
    utils/
      password.js        bcrypt
      jwt.js             sign/verify
      crypto.js          AES-256-GCM for POS keys at rest
      analytics.js       analyze() + salesSeries(), ported from prototype
      csv.js             parseCSV + column detection + mapping, ported
    services/
      email.js           signup notification (nodemailer, console fallback)
      pos.js             POS boundary + sample-data generator
      payment.js         subscription/payment boundary
    routes/
      auth | stores | sales | reports | billing .routes.js
```

Data model: `users 1—* stores 1—* sales`, and `stores 1—* reports` (report = a saved
JSON snapshot of analytics output, last 20 kept per store).

## Status

### Built (real)
- Email + password auth, bcrypt hashing, JWT tokens.
- PostgreSQL persistence for users, stores, sales, reports.
- CSV ingestion: any column names, auto-detected, confirmable mapping.
- Server-side report generation (identical math to the prototype) + history.
- Free-report paywall gating (`FREE_REPORTS`, default 1; price `SUBSCRIPTION_PRICE_KZT`).
- Signup email notification to the owner (console fallback when SMTP unset).
- POS API keys encrypted at rest (AES-256-GCM).

### Stubbed (need external accounts/docs)
- **POS providers** — `src/services/pos.js`. With `STUB_POS=true`, sync returns generated
  sample data so the flow is demonstrable. To finish: implement one async client per
  provider `(connection) => salesRows[]` and register it in `PROVIDER_CLIENTS`. The
  encrypted key is decrypted and passed in `connection.apiKey`.
- **Payments** — `src/services/payment.js`. Stub auto-confirms `POST /api/billing/subscribe`.
  To finish: `createCheckout()` calls Kaspi/card and returns a real URL; the provider hits
  `POST /api/billing/webhook`; verify the signature in `verifyWebhook()` then set
  `subscribed = true`.

## Next steps (when credentials arrive)

1. **Pick the first POS provider** (likely Kaspi or Webkassa), get API docs + a sandbox
   key, implement the client, set `STUB_POS=false`.
2. **Payments**: open a Kaspi merchant / card-acquiring account; implement checkout +
   webhook; replace the auto-confirm stub.
3. **SMTP**: create a Gmail App Password (or a transactional provider) and fill `SMTP_*`.
4. **Frontend wiring** (below).

## Frontend wiring

Replace the prototype's `localStorage` helpers with API calls. Mapping:

| Prototype | Replace with |
| --- | --- |
| `doSignup()` / `doLogin()` | `POST /api/auth/signup` / `/login`, save returned `token` |
| `currentUser()` / session | `GET /api/auth/me` using the stored token |
| `persistUser`, stores in `localStorage` | `GET/POST/PATCH/DELETE /api/stores` |
| `buildSalesFromMap()` upload | `POST /api/stores/:id/sales/detect` then `/csv` |
| `openConnectModal` / `syncSales` | `POST /api/stores/:id/sales/connect` / `/sync` |
| `takeReport()` / history | `POST /api/stores/:id/reports`, `GET .../reports` |
| `showPaywall` subscribe | `POST /api/billing/subscribe` |

Report `data`/`series` shapes are unchanged, so `statsPage`, `recsPage`, `lineChart`, and
`printReport` keep working as-is.

## Security notes / TODO
- Add rate limiting on `/api/auth/*` (e.g. `express-rate-limit`) before launch.
- Consider refresh tokens / shorter access-token lifetime for production.
- The webhook must verify provider signatures before trusting `email`.
- Set a strong `APP_ENCRYPTION_KEY` in production (don't fall back to `JWT_SECRET`).
