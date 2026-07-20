/// <reference types="cypress" />

import { catalogCategories, catalogProducts } from './catalog';

interface MockCatalogOptions {
  failOnce?: string[];
  failAlways?: string[];
}

function filterProducts(where: any): typeof catalogProducts {
  let products = [...catalogProducts];
  const search = where?.name?._ilike?.replaceAll('%', '').toLowerCase();
  const category = where?.category?.name?._eq;
  const subcategories: string[] | undefined = where?.subcategory?.name?._in;
  const minimum = where?.price?._gte;
  const maximum = where?.price?._lte;

  if (search) products = products.filter((product) => product.name.toLowerCase().includes(search));
  if (category) products = products.filter((product) => product.category.name === category);
  if (subcategories?.length) {
    products = products.filter((product) => subcategories.includes(product.subcategory.name));
  }
  if (minimum != null) products = products.filter((product) => product.price >= minimum);
  if (maximum != null) products = products.filter((product) => product.price <= maximum);
  return products;
}

Cypress.Commands.add('mockCatalog', (options: MockCatalogOptions = {}) => {
  const failures = new Map<string, number>();

  cy.intercept('POST', 'https://webshop.hasura.app/v1/graphql', (request) => {
    const operation = request.body.operationName as string;
    request.alias = `gql${operation}`;

    const failureCount = failures.get(operation) ?? 0;
    failures.set(operation, failureCount + 1);
    if (options.failAlways?.includes(operation) || (options.failOnce?.includes(operation) && failureCount === 0)) {
      request.reply({ statusCode: 503, body: { errors: [{ message: 'Catalog unavailable' }] } });
      return;
    }

    const variables = request.body.variables ?? {};
    switch (operation) {
      case 'GetProductsPage': {
        let products = filterProducts(variables.where);
        const direction = variables.orderBy?.[0]?.price ?? 'asc';
        products.sort((left, right) => direction === 'desc' ? right.price - left.price : left.price - right.price);
        const total = products.length;
        products = products.slice(variables.offset, variables.offset + variables.limit);
        request.reply({ data: { product: products, product_aggregate: { aggregate: { count: total } } } });
        return;
      }
      case 'GetPriceBounds': {
        const products = filterProducts(variables.where);
        const prices = products.map((product) => product.price);
        request.reply({
          data: {
            product_aggregate: {
              aggregate: {
                min: { price: prices.length ? Math.min(...prices) : null },
                max: { price: prices.length ? Math.max(...prices) : null },
              },
            },
          },
        });
        return;
      }
      case 'GetProductCategories':
        request.reply({ data: { category: catalogCategories } });
        return;
      case 'GetSuggestedProducts':
        request.reply({ data: { product: catalogProducts.slice(-10).reverse() } });
        return;
      case 'GetProductsByIds':
        request.reply({ data: { product: catalogProducts.filter((product) => variables.ids.includes(product.id)) } });
        return;
      case 'GetProductById':
        request.reply({ data: { product: catalogProducts.filter((product) => product.id === variables.id) } });
        return;
      case 'GetProductsByCategory':
        request.reply({ data: { product: catalogProducts.filter((product) => product.category.name === variables.category) } });
        return;
      default:
        request.reply({ data: {} });
    }
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      mockCatalog(options?: MockCatalogOptions): Chainable<void>;
    }
  }
}

export {};
