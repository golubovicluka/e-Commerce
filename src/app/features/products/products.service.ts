import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

// Common fragment for product fields
const PRODUCT_FIELDS = `
  fragment ProductFields on product {
    EAN
    categoryId
    subcategoryId
    description
    id
    images
    inStock
    name
    price
    category {
      id
      name
    }
    subcategory {
      id
      name
    }
  }
`;

// Options for a single, server-side paginated product query.
export interface ProductQueryOptions {
  where?: any;
  orderBy?: any[];
  limit: number;
  offset: number;
}

interface GraphqlResponse<T> {
  data?: T | null;
  errors?: Array<{ message?: string }>;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  categoryFilter$ = new Subject<string>();
  categoryFilter = this.categoryFilter$.asObservable();
  private readonly cache = new Map<string, Observable<{ data: any }>>();

  constructor(private http: HttpClient) {}

  setCategoryFilter(category: string): void {
    this.categoryFilter$.next(category);
  }

  /**
   * Server-side paginated product query.
   *
   * Fetches only the requested page (`limit`/`offset`) plus the total matching
   * count in a single round trip, so the browser never loads the whole table.
   * The `where`/`orderBy` are Hasura `product_bool_exp` / `product_order_by`
   * expressions, letting one method cover search, category, subcategory, price
   * and sort instead of a separate unbounded query per filter.
   */
  getProductsPage(options: ProductQueryOptions) {
    return this.query(
      'GetProductsPage',
      `
        query GetProductsPage($where: product_bool_exp, $orderBy: [product_order_by!], $limit: Int!, $offset: Int!) {
          product(where: $where, order_by: $orderBy, limit: $limit, offset: $offset) {
            ...ProductFields
          }
          product_aggregate(where: $where) {
            aggregate {
              count
            }
          }
        }
        ${PRODUCT_FIELDS}
      `,
      {
        where: options.where ?? {},
        orderBy: options.orderBy ?? [{ price: 'asc' }],
        limit: options.limit,
        offset: options.offset,
      },
    );
  }

  /**
   * Min/max price for the given filter, computed by the database aggregate.
   * Used to drive the price-range slider bounds without pulling every row into
   * memory (the old approach sorted the full result set client-side).
   */
  getPriceBounds(where: any = {}) {
    return this.query(
      'GetPriceBounds',
      `
        query GetPriceBounds($where: product_bool_exp) {
          product_aggregate(where: $where) {
            aggregate {
              min {
                price
              }
              max {
                price
              }
            }
          }
        }
      `,
      { where },
    );
  }

  getProductsByIds(ids: number[]) {
    return this.query(
      'GetProductsByIds',
      `
        query GetProductsByIds($ids: [Int!]!) {
          product(where: { id: { _in: $ids } }) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      { ids },
    );
  }

  getProductById(id: number) {
    return this.query(
      'GetProductById',
      `
        query GetProductById($id: Int!) {
          product(where: { id: { _eq: $id } }) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      { id },
    );
  }

  getProductsByCategory(category: string) {
    return this.query(
      'GetProductsByCategory',
      `
        query GetProductsByCategory($category: String!) {
          product(where: {category: {name: {_eq: $category}}}) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      { category },
    );
  }

  // Get categories and subcategories for filter component
  getProductCategories() {
    return this.query(
      'GetProductCategories',
      `
        query GetProductCategories {
          category {
            id
            name
            subcategories {
              name
              id
              categoryId
            }
          }
        }
      `,
    );
  }

  getSuggestedProducts() {
    return this.query(
      'GetSuggestedProducts',
      `
        query GetSuggestedProducts {
          product(limit: 10, order_by: { id: desc }) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
    );
  }

  private query<T = any>(
    operationName: string,
    query: string,
    variables?: Record<string, unknown>,
  ): Observable<{ data: T }> {
    const key = `${operationName}:${JSON.stringify(variables ?? {})}`;
    const cached = this.cache.get(key);
    if (cached) {
      return cached as Observable<{ data: T }>;
    }

    const request$ = this.http
      .post<GraphqlResponse<T>>(environment.graphqlEndpoint, {
        operationName,
        query,
        variables,
      })
      .pipe(
        map((response) => {
          if (response.errors?.length && !response.data) {
            throw new Error(response.errors[0].message);
          }
          return { data: response.data as T };
        }),
        catchError((error) => {
          this.cache.delete(key);
          return throwError(() => error);
        }),
        shareReplay(1),
      );

    this.cache.set(key, request$);
    return request$;
  }
}
