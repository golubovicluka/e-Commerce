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

@Injectable({
  providedIn: 'root'
})
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
    return this.apollo.watchQuery({
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
    }).valueChanges;
  }

  /**
   * Min/max price for the given filter, computed by the database aggregate.
   * Used to drive the price-range slider bounds without pulling every row into
   * memory (the old approach sorted the full result set client-side).
   */
  getPriceBounds(where: any = {}) {
    return this.apollo.watchQuery({
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
    }).valueChanges;
  }

  // Get all products (including sortBy and category)
  getProducts(sortBy?: string, category?: string) {
    if (category && sortBy) {
      return this.apollo.watchQuery({
        query: gql`
          query GetProducts($category: String!, $sortBy: order_by!) {
            product(where: {category: {name: {_eq: $category}}}, order_by: {price: $sortBy}) {
              ...ProductFields
            }
          }
          ${PRODUCT_FIELDS}
        `,
        variables: { category, sortBy }
      }).valueChanges;
    } else if (category) {
      return this.apollo.watchQuery({
        query: gql`
          query GetProductsByCategory($category: String!) {
            product(where: {category: {name: {_eq: $category}}}) {
              ...ProductFields
            }
          }
          ${PRODUCT_FIELDS}
        `,
        variables: { category }
      }).valueChanges;
    } else if (sortBy) {
      return this.apollo.watchQuery({
        query: gql`
          query GetProductsSorted($sortBy: order_by!) {
            product(order_by: {price: $sortBy}) {
              ...ProductFields
            }
          }
          ${PRODUCT_FIELDS}
        `,
        variables: { sortBy }
      }).valueChanges;
    } else {
      return this.getProductsDefault();
    }
  }

  getProductsDefault() {
    return this.apollo.watchQuery({
      query: gql`
        query GetProductsDefault {
          product {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `
    }).valueChanges;
  }

  getProductsByPrice(priceFrom: number, priceTo: number) {
    return this.apollo.watchQuery({
      query: gql`
        query GetProductsByPrice($priceFrom: numeric!, $priceTo: numeric!) {
          product(where: {price: {_gte: $priceFrom, _lte: $priceTo}}) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      variables: {
        priceFrom,
        priceTo
      }
    }).valueChanges;
  }

  searchProducts(searchInput: string) {
    return this.apollo.watchQuery({
      query: gql`
        query SearchProducts($searchInput: String!) {
          product(where: { name: { _ilike: $searchInput } }) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      variables: {
        searchInput: `%${searchInput}%`
      }
    }).valueChanges;
  }

  getProductsByIds(ids: number[]) {
    return this.apollo.watchQuery({
      query: gql`
        query GetProductsByIds($ids: [Int!]!) {
          product(where: { id: { _in: $ids } }) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      variables: { ids }
    }).valueChanges;
  }

  getProductById(id: number) {
    return this.apollo.watchQuery({
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
    }).valueChanges;
  }

  getProductsByCategory(category: string) {
    return this.apollo.watchQuery({
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
    }).valueChanges;
  }

  getFilteredProducts(filter: string[]) {
    if (filter.length === 0) {
      return this.getProductsDefault();
    }

    return this.apollo.watchQuery({
      query: gql`
        query GetFilteredProducts($filter: [String!]!) {
          product(where: {subcategory: {name: {_in: $filter}}}) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `,
      variables: {
        filter
      }
    }).valueChanges;
  }

  // Get categories and subcategories for filter component
  getProductCategories() {
    return this.apollo.watchQuery({
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
    }).valueChanges;
  }

  getSuggestedProducts() {
    return this.apollo.watchQuery({
      query: gql`
        query GetSuggestedProducts {
          product(limit: 10, order_by: { id: desc }) {
            ...ProductFields
          }
        }
        ${PRODUCT_FIELDS}
      `
    }).valueChanges;
  }

  // Legacy methods for backward compatibility
  getProductBySubcategory(category: string) {
    return this.getProductsByCategory(category);
  }

  getProductsFromSubcategories(categories: string[]) {
    return this.getFilteredProducts(categories);
  }
}
