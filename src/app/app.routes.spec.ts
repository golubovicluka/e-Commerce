import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

describe('application routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  it('lazy-loads every routed page', async () => {
    const pagePaths = ['home', 'products/search', 'categories', 'product/:id', 'wishlist', 'cart', '404'];
    const pageRoutes = routes.filter((route) => pagePaths.includes(route.path ?? ''));

    expect(pageRoutes).toHaveLength(pagePaths.length);
    expect(
      pageRoutes.every(
        (route) => typeof route.loadComponent === 'function' || typeof route.loadChildren === 'function',
      ),
    ).toBe(true);

    for (const route of pageRoutes) {
      const loaded = route.loadChildren
        ? await route.loadChildren()
        : await route.loadComponent!();
      expect(loaded).toBeTruthy();
    }

    const cartRoute = routes.find((route) => route.path === 'cart');
    for (const child of cartRoute?.children ?? []) {
      expect(await child.loadComponent!()).toBeTruthy();
    }
  });

  it('redirects unknown URLs to the not-found route', () => {
    expect(routes.find((route) => route.path === '')).toEqual(
      expect.objectContaining({ redirectTo: 'home', pathMatch: 'full' }),
    );
    expect(routes.at(-1)).toEqual(
      expect.objectContaining({ path: '**', redirectTo: '404' }),
    );
  });
});
