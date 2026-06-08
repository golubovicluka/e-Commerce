# Security

## Reporting

Please report security issues privately to the repository owner rather than
opening a public issue.

## Backend configuration required (action needed)

This is a client-only Angular SPA. It talks to a hosted Hasura GraphQL API and
**must not** carry any database credentials, because all client-side code is
shipped to the browser and is publicly readable.

### 1. Rotate the leaked Hasura admin secret — URGENT

A Hasura `x-hasura-admin-secret` was previously hardcoded in
`src/app/app.module.ts`. It was compiled into every production bundle and is
present in this repository's git history, so it must be treated as fully
compromised:

- Rotate (regenerate) the admin secret in the Hasura Cloud dashboard now.
- Keep the new admin secret server-side only (Hasura console / env vars). Never
  place it in this repository or in any front-end code.

### 2. Expose the catalog through a read-only `anonymous` role

The app only **reads** the public product catalog (there are no mutations). Give
Hasura's `anonymous` role `select` permission so the storefront works without
any secret:

- In Hasura → **Settings → Roles/Permissions**, enable the `anonymous` role
  (set `HASURA_GRAPHQL_UNAUTHORIZED_ROLE=anonymous`).
- Grant `anonymous` **`select`-only** permission (no insert/update/delete) on the
  tables the catalog uses: `product`, `category`, `subcategory`.
- Limit selectable columns to those actually rendered by the UI and, if desired,
  add row limits/aggregation limits to prevent scraping abuse.

The browser sends **no** auth header (see `app.module.ts`), so until the
`anonymous` role is configured the deployed app will receive
"permission denied" for catalog queries. The app still builds and deploys; only
live data depends on this backend step.

### 3. Lock down the endpoint

- Restrict Hasura **CORS** to your production/staging origins only.
- Disable schema introspection in production.
- Consider Hasura's allow-list so only the queries this app uses are accepted.

## Tracked follow-ups

- **Dependency upgrades:** the app is on end-of-life Angular 15 / PrimeNG 15 with
  known high-severity advisories. A major-version migration is tracked separately.
- **Authentication / authorization:** there is currently no user auth. If
  authenticated features (orders, accounts, writes) are added, introduce JWT/session
  auth with per-role Hasura permissions and Angular route guards. Tracked separately.
