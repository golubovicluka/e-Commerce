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
  ])('lazy-loads the %s page', async (_name, routes) => {
    expect(routes).toHaveLength(1);
    expect(await routes[0].loadComponent!()).toBeTruthy();
  });
});
