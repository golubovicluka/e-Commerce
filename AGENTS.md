# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

**Shoply** is a single Angular 15 SPA (`package.json` name: `datastructures`). Catalog data comes from remote **Hasura GraphQL** at `https://webshop.hasura.app/v1/graphql` (configured in `src/app/app.module.ts`). Cart and wishlist persist in browser `localStorage`. There is no local backend, Docker, or monorepo workspace.

### Services

| Service | Port | Required |
|---------|------|----------|
| Angular dev server (`npm start` / `ng serve`) | 4200 | Yes |
| Hasura GraphQL (hosted) | HTTPS | Yes (outbound network) |

### Common commands

See `README.md` for clone/install/serve steps. Quick reference:

- **Install deps:** `npm install`
- **Dev server:** `npm start` (or `ng serve --host 0.0.0.0 --port 4200` in Cloud VMs)
- **Production build:** `npm run build` → output in `dist/project`
- **Unit tests:** `npm run test -- --browsers=ChromeHeadless --watch=false` (Karma on port 9876)
- **Lint:** `npx eslint "src/**/*.ts"` (no `npm run lint` script in `package.json`)
- **E2E:** `npx cypress open` (requires app on `http://localhost:4200`; see Cypress caveats below)

### Non-obvious caveats

- **Node:** Works on Node 22 in this environment; Angular 15 officially supports Node 14.20+, 16.13+, or 18.10+.
- **Hasura auth:** The app sends `x-hasura-admin-secret` via Apollo (`app.module.ts`). Direct `curl` to the GraphQL endpoint without that header returns access-denied; use the running app or mirror those headers.
- **Unit tests:** As of setup, many specs in `products.service.spec.ts` fail (mock/expectation mismatches). Lint, build, and the running app still work; do not assume green `ng test` means the environment is broken.
- **Cypress:** `cypress.config.ts` has no `baseUrl`. Several specs use `[data-cy="..."]` attributes not present in `src/`. `home.cy.ts` references a removed Login nav link.
- **No git hooks:** No Husky/pre-commit; nothing extra to run before commits.

### Cloud Agent workflow

1. `npm install`
2. Start dev server in tmux (long-running): e.g. session `angular-dev-server` with `npm start -- --host 0.0.0.0 --port 4200 --disable-host-check`
3. Verify with `curl -s -o /dev/null -w "%{http_code}" http://localhost:4200/` → `200`
4. Smoke-test core flow in browser: home → product detail → add to cart → cart shows item
