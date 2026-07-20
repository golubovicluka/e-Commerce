import {
  CATEGORIES_ROUTES,
  HOME_ROUTES,
  PRODUCT_DETAILS_ROUTES,
  PRODUCTS_ROUTES,
} from './catalog.routes';

describe('catalog routes', () => {
  it.each([
    ['home', HOME_ROUTES],
    ['products', PRODUCTS_ROUTES],
    ['categories', CATEGORIES_ROUTES],
    ['product details', PRODUCT_DETAILS_ROUTES],
  ])('lazy-loads the %s page with route-scoped providers', async (_name, routes) => {
    expect(routes).toHaveLength(1);
    expect(routes[0].providers).toBeTruthy();
    expect(await routes[0].loadComponent!()).toBeTruthy();
  });
});
