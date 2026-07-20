import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./features/catalog.routes').then((catalog) => catalog.HOME_ROUTES),
  },
  {
    path: 'products/search',
    loadChildren: () =>
      import('./features/catalog.routes').then((catalog) => catalog.PRODUCTS_ROUTES),
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('./features/catalog.routes').then((catalog) => catalog.CATEGORIES_ROUTES),
  },
  {
    path: 'product/:id',
    loadChildren: () =>
      import('./features/catalog.routes').then((catalog) => catalog.PRODUCT_DETAILS_ROUTES),
  },
  {
    path: 'wishlist',
    title: 'Wishlist — Shoply',
    loadComponent: () =>
      import('./features/wishlist/wishlist-view.component').then(
        (component) => component.WishlistViewComponent,
      ),
  },
  {
    path: 'cart',
    title: 'Cart — Shoply',
    loadComponent: () =>
      import('./features/cart-view/cart-view.component').then(
        (component) => component.CartViewComponent,
      ),
    children: [
      {
        path: 'shipping',
        loadComponent: () =>
          import('./features/cart-view/shipping/shipping.component').then(
            (component) => component.ShippingComponent,
          ),
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./features/cart-view/overview/overview.component').then(
            (component) => component.OverviewComponent,
          ),
      },
      {
        path: 'payment',
        loadComponent: () =>
          import('./features/cart-view/payment/payment.component').then(
            (component) => component.PaymentComponent,
          ),
      },
    ],
  },
  {
    path: '404',
    title: 'Page not found — Shoply',
    loadComponent: () =>
      import('./shared/not-found/not-found.component').then(
        (component) => component.NotFoundComponent,
      ),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: '404' },
];
