# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

**Shoply** is a single Angular 22 standalone SPA (`package.json` name: `shoply`). Catalog data comes from remote **Hasura GraphQL** at `https://webshop.hasura.app/v1/graphql` (configured through `src/app/features/products/catalog-data.providers.ts`). Cart and wishlist persist in browser `localStorage`. There is no local backend, Docker, or monorepo workspace.

### Services

| Service | Port | Required |
|---------|------|----------|
| Angular dev server (`npm start` / `ng serve`) | 4200 | Yes |
| Hasura GraphQL (hosted) | HTTPS | Yes (outbound network) |

### Common commands

See `README.md` for clone/install/serve steps. Quick reference:

- **Install deps:** `npm install`
- **Dev server:** `npm start` (or `ng serve --host 0.0.0.0 --port 4200` in Cloud VMs)
- **Production build:** `npm run build` → browser output in `dist/project/browser`
- **Unit tests:** `npm run test:ci` (Jest with 100% coverage thresholds)
- **Lint:** `npm run lint`
- **E2E:** `npm run e2e:ci` (requires app on `http://localhost:4200`)

### Non-obvious caveats

- **Node:** Use Node 24.15.0 from `.nvmrc`; Angular 22 requires Node `^22.22.3`, `^24.15.0`, or `>=26`.
- **Hasura auth:** The browser sends **no** authorization header. Catalog queries rely on a read-only Hasura `anonymous` role configured on the backend. Until that role is enabled, direct `curl` and the live app receive `access-denied` — see `SECURITY.md` for the required Hasura Cloud setup (not a client bug).
- **Unit tests:** `npm run test:ci` runs 283 specs in Jest and enforces 100% statement, branch, function, and line coverage for executable `src/app` code.
- **Cypress:** Browser flows use semantic selectors and deterministic GraphQL intercepts. Run the Angular app on `http://localhost:4200` before `npm run e2e:ci`.
- **UI library:** Tailwind CSS 4 + FlyonUI 2 (MIT, CSS only). PostCSS is configured in `.postcssrc.json`; `src/tailwind.css` loads Tailwind, FlyonUI, the `shoply` theme, and the Iconify plugin, and is listed before `src/styles.scss` in `angular.json`. PrimeNG, PrimeFlex, and PrimeIcons are fully removed; do not reintroduce them or any other component library.
- **UI rules:** Use FlyonUI semantic classes (`btn btn-primary`, `input`, `select`, `badge`, `alert`, `skeleton`, `breadcrumbs`, `indicator`) instead of hand-rolled primitives. FlyonUI JavaScript plugins are not loaded, so `data-accordion`/`data-overlay` style attributes do nothing; keep interactivity in Angular. FlyonUI has no `btn-ghost`; use `btn-text`.
- **Icons:** Tabler via Iconify only: `<span class="icon-[tabler--home] size-4" aria-hidden="true"></span>`. Write full literal class names (also in `.ts`), never concatenate them, because Tailwind detects classes from source text.
- **Breakpoints:** `src/tailwind.css` sets Tailwind's `sm`/`md`/`lg`/`xl`/`2xl` to 576/768/992/1200/1400px so utilities match the SCSS media queries. Avoid arbitrary `min-[...]` variants: Tailwind orders them before named breakpoints, so they lose to `md:` and the like.
- **CSS layering:** Tailwind and FlyonUI classes live in CSS layers, so unlayered component SCSS wins over them. When a responsive visibility utility sits on an element whose SCSS sets `display`, use the important suffix (`hidden! md:flex!`).
- **No git hooks:** No Husky/pre-commit; nothing extra to run before commits.

### Cloud Agent workflow

1. `npm install`
2. Start dev server in tmux (long-running): e.g. session `angular-dev-server` with `npm start -- --host 0.0.0.0 --port 4200`
3. Verify with `curl -s -o /dev/null -w "%{http_code}" http://localhost:4200/` → `200`
4. Smoke-test core flow in browser: home → product detail → add to cart → cart shows item
