# Publish RevUp

Status: deployment prepared locally; no hosting resources have been created.

The working application is `backend/`, including its connected frontend in
`backend/public/`. The separate Desktop/revup directory is an older prototype.

## Hosting

`render.yaml` defines a Free Node web service in Frankfurt using your existing
Neon PostgreSQL database. It creates no Render database or paid resources.
Stay on the free plans and within their usage limits. Render Free sleeps when
idle and blocks crawlers while asleep, so search indexing is less reliable.

1. Sign in at https://dashboard.render.com/ and connect a GitHub account.
2. Put this project in a private GitHub repository, excluding `.env`, node_modules,
   and personal assistant files (the root `.gitignore` covers these).
3. Create a Render Blueprint from that repository using `render.yaml`.
4. Supply the existing Neon `DATABASE_URL` and `APP_ENCRYPTION_KEY` from the local
   `backend/.env` as secret environment variables in Render. Never put `.env` in
   GitHub. Preserve the encryption key so existing POS credentials remain readable.
   Confirm the service plan is Free, then deploy. The configuration installs
   dependencies, applies the idempotent schema on startup, generates a new JWT
   secret, and starts RevUp. Free services cannot use a pre-deploy command.
5. Open the HTTPS address shown by Render. Test signup, login, CSV upload, and a
   report with a fresh test account. `/api/ready` must return HTTP 200.

The deployed app uses the same Neon data as your local app; no data is copied.
The new JWT secret requires users to sign in again. Review any demo accounts
before launch and do not run the demo seed on the public database. Render Free
blocks standard SMTP ports; signup email needs a supported HTTPS email provider
or a different hosting plan. Real POS integrations and payment processing
still need implementation; production disables sample POS results and fake
subscription activation. CSV-based reports remain available.

## Search engines

The public homepage includes readable HTML, description and social metadata.
The server generates `/robots.txt`, `/sitemap.xml`, and a canonical address from
`PUBLIC_SITE_URL`, falling back to Render's `RENDER_EXTERNAL_URL`.

1. If adding a custom domain, configure it in Render and its DNS provider, wait
   for HTTPS, then set `PUBLIC_SITE_URL` to that HTTPS origin and redeploy.
2. Add the public address to Google Search Console and Yandex Webmaster.
3. Use their HTML-tag verification options. Store only the provided content
   values as `GOOGLE_SITE_VERIFICATION` and `YANDEX_SITE_VERIFICATION` in Render,
   redeploy, then complete verification.
4. Submit `/sitemap.xml` to both services and request homepage indexing.

Chrome is a browser; its selected search engine determines search results.
Indexing and rankings are controlled by search engines and are not guaranteed.

References:
- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/blueprint-spec
- https://render.com/docs/free
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://yandex.com/support/webmaster/en/indexing-options/sitemap

## Local validation

From `backend/`: `node --test src/deployment.test.js`.
The checks use a disposable HTTP listener and an unreachable test database;
they do not write to your existing database. Live hosting, database migrations,
and a complete account/report workflow still require verification after deploy.
