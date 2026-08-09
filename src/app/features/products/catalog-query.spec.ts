import { convertToParamMap } from '@angular/router';
import {
  buildCatalogWhere,
  catalogQueriesEqual,
  DEFAULT_CATALOG_QUERY,
  parseCatalogQuery,
} from './catalog-query';

describe('catalog query state', () => {
  it('uses safe defaults for an empty URL', () => {
    expect(parseCatalogQuery(convertToParamMap({}))).toEqual(DEFAULT_CATALOG_QUERY);
  });

  it('normalizes valid query parameters and caps excessive values', () => {
    const state = parseCatalogQuery(
      convertToParamMap({
        q: `  ${'x'.repeat(120)}  `,
        categoryId: '3',
        category: ' Home ',
        subcategoryId: ['5', '5', '6', '0', 'invalid'],
        sort: 'desc',
        page: '999999',
        pageSize: '20',
        minPrice: '500',
        maxPrice: '100',
        layout: 'list',
      }),
    );

    expect(state).toEqual({
      search: 'x'.repeat(100),
      categoryId: 3,
      categoryName: 'Home',
      subcategoryIds: [5, 6],
      sort: 'desc',
      page: 100_000,
      pageSize: 20,
      minPrice: 100,
      maxPrice: 500,
      layout: 'list',
    });
  });

  it('rejects malformed integers, prices, and enum values', () => {
    const state = parseCatalogQuery(
      convertToParamMap({
        categoryId: '9007199254740992',
        subcategoryId: ['-1', '1.5'],
        sort: 'sideways',
        page: '1.5',
        pageSize: '15',
        minPrice: '-1',
        maxPrice: 'not-a-number',
        layout: 'cards',
      }),
    );

    expect(state).toEqual(DEFAULT_CATALOG_QUERY);
  });

  it('treats blank prices as unset and limits subcategory fan-out', () => {
    const subcategoryIds = Array.from({ length: 25 }, (_, index) => String(index + 1));
    const state = parseCatalogQuery(
      convertToParamMap({ minPrice: ' ', maxPrice: '', subcategoryId: subcategoryIds }),
    );

    expect(state.minPrice).toBeNull();
    expect(state.maxPrice).toBeNull();
    expect(state.subcategoryIds).toHaveLength(20);
  });

  it('builds a combined id-based product expression', () => {
    expect(
      buildCatalogWhere({
        ...DEFAULT_CATALOG_QUERY,
        search: 'phone',
        categoryId: 1,
        categoryName: 'Ignored legacy name',
        subcategoryIds: [1, 2],
        minPrice: 100,
        maxPrice: 500,
      }),
    ).toEqual({
      name: { _ilike: '%phone%' },
      category: { id: { _eq: 1 } },
      subcategory: { id: { _in: [1, 2] } },
      price: { _gte: 100, _lte: 500 },
    });
  });

  it('supports legacy category names and price-independent bounds', () => {
    expect(
      buildCatalogWhere(
        {
          ...DEFAULT_CATALOG_QUERY,
          categoryName: 'Electronics',
          minPrice: 10,
          maxPrice: 20,
        },
        false,
      ),
    ).toEqual({ category: { name: { _eq: 'Electronics' } } });
  });

  it('supports one-sided prices and an empty expression', () => {
    expect(buildCatalogWhere(DEFAULT_CATALOG_QUERY)).toEqual({});
    expect(
      buildCatalogWhere({ ...DEFAULT_CATALOG_QUERY, minPrice: 10 }),
    ).toEqual({ price: { _gte: 10 } });
    expect(
      buildCatalogWhere({ ...DEFAULT_CATALOG_QUERY, maxPrice: 20 }),
    ).toEqual({ price: { _lte: 20 } });
  });

  it('compares every query-state field, including ordered subcategories', () => {
    const baseline = { ...DEFAULT_CATALOG_QUERY, subcategoryIds: [1, 2] };
    expect(catalogQueriesEqual(baseline, { ...baseline, subcategoryIds: [1, 2] })).toBe(true);

    const changes = [
      { search: 'x' },
      { categoryId: 1 },
      { categoryName: 'Electronics' },
      { sort: 'desc' as const },
      { page: 2 },
      { pageSize: 20 as const },
      { minPrice: 1 },
      { maxPrice: 2 },
      { layout: 'list' as const },
      { subcategoryIds: [1] },
      { subcategoryIds: [2, 1] },
    ];

    for (const change of changes) {
      expect(catalogQueriesEqual(baseline, { ...baseline, ...change })).toBe(false);
    }
  });
});
