-- ============================================================================
-- Indexes backing the product search / pagination / filtering queries.
--
-- These support the queries the Angular client now issues (server-side
-- pagination + debounced search). Apply them against the Hasura-managed
-- Postgres database (see ../README.md). Without them, every search is a
-- sequential scan and every category/price filter scans the product table.
--
-- All statements are idempotent. For an existing production table, prefer
-- running each CREATE INDEX with CONCURRENTLY (see the commented variants)
-- so the build does not hold a write lock — note CONCURRENTLY cannot run
-- inside a transaction block.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. CRITICAL: trigram index for case-insensitive substring search.
--
-- The search box queries `product(where: { name: { _ilike: "%term%" } })`.
-- A leading-wildcard ILIKE cannot use a normal B-tree index, so it forces a
-- full sequential scan on every search. A GIN trigram index makes that an
-- index scan.
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_product_name_trgm
  ON product USING gin (name gin_trgm_ops);
-- Production-safe variant:
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_name_trgm
--   ON product USING gin (name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- 2. Price: used for the default `order_by: { price }` sort, the price-range
--    filter (`price: { _gte, _lte }`), and the min/max aggregate that feeds
--    the slider bounds.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_product_price
  ON product (price);

-- ---------------------------------------------------------------------------
-- 3. Foreign-key columns used by the category / subcategory relationship
--    filters. Postgres does NOT auto-index foreign keys, so these joins scan
--    the product table without them.
--
--    NOTE: column names below assume the schema exposes camelCase columns
--    (matching the GraphQL fields `categoryId` / `subcategoryId`). If your
--    Postgres columns are snake_case (category_id / subcategory_id), adjust
--    accordingly and drop the quotes.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_product_category_id
  ON product ("categoryId");

CREATE INDEX IF NOT EXISTS idx_product_subcategory_id
  ON product ("subcategoryId");

-- ---------------------------------------------------------------------------
-- 4. Name lookups on the related tables. The category/subcategory filters
--    match on `name` (`category.name _eq`, `subcategory.name _in`).
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_category_name
  ON category (name);

CREATE INDEX IF NOT EXISTS idx_subcategory_name
  ON subcategory (name);
