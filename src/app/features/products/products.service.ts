import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Apollo, gql } from 'apollo-angular';

// Common fragment for product fields
const PRODUCT_FIELDS = gql`
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

@Injectable()
export class ProductsService {
  categoryFilter$ = new Subject<string>();
  categoryFilter = this.categoryFilter$.asObservable();

  constructor(private apollo: Apollo) { }

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
    return this.apollo.query({
      query: gql`
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
      variables: {
        where: options.where ?? {},
        orderBy: options.orderBy ?? [{ price: 'asc' }],
        limit: options.limit,
        offset: options.offset,
      },
    });
  }

  /**
   * Min/max price for the given filter, computed by the database aggregate.
   * Used to drive the price-range slider bounds without pulling every row into
   * memory (the old approach sorted the full result set client-side).
   */
  getPriceBounds(where: any = {}) {
    return this.apollo.query({
      query: gql`
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
      variables: { where },
    });
  }

  getProductsByIds(ids: number[]) {
    return this.apollo.query({
      query: gql`
        query GetProductsByIds($ids: [Int!]!) {
          product(where: { id: { _in: $ids } }) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      variables: { ids }
    });
  }

  getProductById(id: number) {
    return this.apollo.query({
      query: gql`
        query GetProductById($id: Int!) {
          product(where: { id: { _eq: $id } }) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      variables: {
        id
      }
    });
  }

  getProductsByCategory(category: string) {
    return this.apollo.query({
      query: gql`
        query GetProductsByCategory($category: String!) {
          product(where: {category: {name: {_eq: $category}}}) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      variables: {
        category
      }
    });
  }

  // Get categories and subcategories for filter component
  getProductCategories() {
    return this.apollo.query({
      query: gql`
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
      `
    });
  }

  getSuggestedProducts() {
    return this.apollo.query({
      query: gql`
        query GetSuggestedProducts {
          product(limit: 10, order_by: { id: desc }) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `
    });
  }
}
