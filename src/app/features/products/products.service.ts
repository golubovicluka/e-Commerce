import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Category, Product, Subcategory } from './Product';

export type SortDirection = 'asc' | 'desc';

export interface StringComparison {
  _eq?: string;
  _ilike?: string;
  _in?: string[];
}

export interface NumberComparison {
  _eq?: number;
  _neq?: number;
  _gte?: number;
  _lte?: number;
  _in?: number[];
}

export interface ProductBoolExp {
  id?: NumberComparison;
  name?: StringComparison;
  price?: NumberComparison;
  category?: {
    id?: NumberComparison;
    name?: StringComparison;
  };
  subcategory?: {
    id?: NumberComparison;
    name?: StringComparison;
  };
}

export interface ProductOrderBy {
  id?: SortDirection;
  price?: SortDirection;
}

export interface ProductQueryOptions {
  where?: ProductBoolExp;
  orderBy?: ProductOrderBy[];
  limit: number;
  offset: number;
}

export interface CatalogSubcategory extends Subcategory {
  categoryId: number;
}

export interface CatalogCategory extends Category {
  subcategories: CatalogSubcategory[];
}

export interface ProductListData {
  product: Product[];
}

export interface ProductsPageData extends ProductListData {
  product_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface PriceBoundsData {
  product_aggregate: {
    aggregate: {
      min: { price: number } | null;
      max: { price: number } | null;
    };
  };
}

export interface ProductCategoriesData {
  category: CatalogCategory[];
}

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

const GET_PRODUCTS_PAGE = gql`
  query GetProductsPage(
    $where: product_bool_exp
    $orderBy: [product_order_by!]
    $limit: Int!
    $offset: Int!
  ) {
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
`;

const GET_PRICE_BOUNDS = gql`
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
`;

const GET_PRODUCTS_BY_IDS = gql`
  query GetProductsByIds($ids: [Int!]!) {
    product(where: { id: { _in: $ids } }) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;

const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: Int!) {
    product(where: { id: { _eq: $id } }, limit: 1) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;

const GET_RELATED_PRODUCTS = gql`
  query GetRelatedProducts($category: String!, $excludeId: Int!, $limit: Int!) {
    product(
      where: {
        category: { name: { _eq: $category } }
        id: { _neq: $excludeId }
      }
      order_by: { id: desc }
      limit: $limit
    ) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;

const GET_PRODUCT_CATEGORIES = gql`
  query GetProductCategories {
    category(order_by: { name: asc }) {
      id
      name
      subcategories(order_by: { name: asc }) {
        name
        id
        categoryId
      }
    }
  }
`;

const GET_SUGGESTED_PRODUCTS = gql`
  query GetSuggestedProducts {
    product(limit: 10, order_by: { id: desc }) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;

@Injectable()
export class ProductsService {
  constructor(private readonly apollo: Apollo) {}

  getProductsPage(options: ProductQueryOptions) {
    return this.apollo.query<ProductsPageData>({
      query: GET_PRODUCTS_PAGE,
      variables: {
        where: options.where ?? {},
        orderBy: options.orderBy ?? [{ price: 'asc' }],
        limit: options.limit,
        offset: options.offset,
      },
    });
  }

  getPriceBounds(where: ProductBoolExp = {}) {
    return this.apollo.query<PriceBoundsData>({
      query: GET_PRICE_BOUNDS,
      variables: { where },
    });
  }

  getProductsByIds(ids: number[]) {
    return this.apollo.query<ProductListData>({
      query: GET_PRODUCTS_BY_IDS,
      variables: { ids },
    });
  }

  getProductById(id: number) {
    return this.apollo.query<ProductListData>({
      query: GET_PRODUCT_BY_ID,
      variables: { id },
    });
  }

  getRelatedProducts(category: string, excludeId: number, limit = 4) {
    return this.apollo.query<ProductListData>({
      query: GET_RELATED_PRODUCTS,
      variables: { category, excludeId, limit },
    });
  }

  getProductCategories() {
    return this.apollo.query<ProductCategoriesData>({
      query: GET_PRODUCT_CATEGORIES,
    });
  }

  getSuggestedProducts() {
    return this.apollo.query<ProductListData>({
      query: GET_SUGGESTED_PRODUCTS,
    });
  }
}
