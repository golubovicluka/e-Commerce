# Database

The app talks to a Hasura GraphQL backend over Postgres. The schema itself is
managed in Hasura, but the indexes the client queries depend on are tracked
here so they're reviewable and reproducible.

## Migrations

### `migrations/0001_search_pagination_indexes.sql`

Indexes that back the product **search**, **pagination**, **sorting**, and
**category / price filtering** queries. The headline one is a `pg_trgm` GIN
index on `product.name`: the search box uses a leading-wildcard `ILIKE
'%term%'`, which cannot use a B-tree index and otherwise sequential-scans the
whole `product` table on every search.

## How to apply

Pick whichever matches your workflow:

**Hasura Console → Data → SQL tab**
Paste the contents of the migration file and run it. Leave "track this" off
(these are indexes, not tables).

**Hasura CLI**
```bash
hasura migrate apply --database-name default
```
(if you import the SQL into Hasura's own migrations directory)

**psql directly**
```bash
psql "$DATABASE_URL" -f database/migrations/0001_search_pagination_indexes.sql
```

## Notes

- All statements use `IF NOT EXISTS`, so re-running is safe.
- On a large, live table, prefer the `CREATE INDEX CONCURRENTLY` variants
  (commented in the file) to avoid holding a write lock during the build.
  `CONCURRENTLY` cannot run inside a transaction block.
- The foreign-key index statements assume camelCase column names
  (`"categoryId"`, `"subcategoryId"`). If your columns are snake_case, adjust
  the identifiers and drop the quotes.
