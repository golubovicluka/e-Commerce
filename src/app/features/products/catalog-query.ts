import { ParamMap } from '@angular/router';
import { ProductBoolExp, SortDirection } from './products.service';

export const CATALOG_PAGE_SIZES = [10, 20, 30] as const;
export type CatalogPageSize = (typeof CATALOG_PAGE_SIZES)[number];
export type CatalogLayout = 'grid' | 'list';

export interface CatalogQueryState {
  search: string;
  categoryId: number | null;
  categoryName: string;
  subcategoryIds: number[];
  sort: SortDirection;
  page: number;
  pageSize: CatalogPageSize;
  minPrice: number | null;
  maxPrice: number | null;
  layout: CatalogLayout;
}

export const DEFAULT_CATALOG_QUERY: CatalogQueryState = {
  search: '',
  categoryId: null,
  categoryName: '',
  subcategoryIds: [],
  sort: 'asc',
  page: 1,
  pageSize: 10,
  minPrice: null,
  maxPrice: null,
  layout: 'grid',
};

function cleanText(value: string | null, maxLength: number): string {
  return (value ?? '').trim().slice(0, maxLength);
}

function parsePositiveInteger(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function parsePrice(value: string | null): number | null {
  if (value === null || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function parseCatalogQuery(params: ParamMap): CatalogQueryState {
  const parsedPage = parsePositiveInteger(params.get('page'));
  const parsedPageSize = parsePositiveInteger(params.get('pageSize'));
  const pageSize = CATALOG_PAGE_SIZES.includes(parsedPageSize as CatalogPageSize)
    ? (parsedPageSize as CatalogPageSize)
    : DEFAULT_CATALOG_QUERY.pageSize;

  const subcategoryIds = [
    ...new Set(
      params
        .getAll('subcategoryId')
        .map(parsePositiveInteger)
        .filter((value): value is number => value !== null),
    ),
  ].slice(0, 20);

  let minPrice = parsePrice(params.get('minPrice'));
  let maxPrice = parsePrice(params.get('maxPrice'));
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  return {
    search: cleanText(params.get('q'), 100),
    categoryId: parsePositiveInteger(params.get('categoryId')),
    categoryName: cleanText(params.get('category'), 80),
    subcategoryIds,
    sort: params.get('sort') === 'desc' ? 'desc' : 'asc',
    page: Math.min(parsedPage ?? DEFAULT_CATALOG_QUERY.page, 100_000),
    pageSize,
    minPrice,
    maxPrice,
    layout: params.get('layout') === 'list' ? 'list' : 'grid',
  };
}

export function catalogQueriesEqual(
  left: CatalogQueryState,
  right: CatalogQueryState,
): boolean {
  return (
    left.search === right.search &&
    left.categoryId === right.categoryId &&
    left.categoryName === right.categoryName &&
    left.sort === right.sort &&
    left.page === right.page &&
    left.pageSize === right.pageSize &&
    left.minPrice === right.minPrice &&
    left.maxPrice === right.maxPrice &&
    left.layout === right.layout &&
    left.subcategoryIds.length === right.subcategoryIds.length &&
    left.subcategoryIds.every((id, index) => id === right.subcategoryIds[index])
  );
}

export function buildCatalogWhere(
  state: CatalogQueryState,
  includePrice = true,
): ProductBoolExp {
  const where: ProductBoolExp = {};

  if (state.search) where.name = { _ilike: `%${state.search}%` };
  if (state.categoryId !== null) {
    where.category = { id: { _eq: state.categoryId } };
  } else if (state.categoryName) {
    where.category = { name: { _eq: state.categoryName } };
  }
  if (state.subcategoryIds.length > 0) {
    where.subcategory = { id: { _in: state.subcategoryIds } };
  }
  if (includePrice && (state.minPrice !== null || state.maxPrice !== null)) {
    where.price = {
      ...(state.minPrice !== null ? { _gte: state.minPrice } : {}),
      ...(state.maxPrice !== null ? { _lte: state.maxPrice } : {}),
    };
  }

  return where;
}
