import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    title: 'Shoply — Technology for everyday life',
    loadComponent: () =>
      import('./home/home.component').then((component) => component.HomeComponent),
  },
];

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    title: 'Products — Shoply',
    loadComponent: () =>
      import('./products/products-view.component').then(
        (component) => component.ProductsViewComponent,
      ),
  },
];

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    title: 'Categories — Shoply',
    loadComponent: () =>
      import('./products/categories-view/categories-view.component').then(
        (component) => component.CategoriesViewComponent,
      ),
  },
];

export const PRODUCT_DETAILS_ROUTES: Routes = [
  {
    path: '',
    title: 'Product — Shoply',
    loadComponent: () =>
      import('./products/product/product-details/product-details.component').then(
        (component) => component.ProductDetailsComponent,
      ),
  },
];
