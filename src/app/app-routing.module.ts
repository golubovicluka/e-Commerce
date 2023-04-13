import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { ProductDetailsComponent } from './features/products/product/product-details/product-details.component';
import { ProductsViewComponent } from './features/products/products-view.component';
import { WishlistViewComponent } from './features/wishlist/wishlist-view.component';
import { CategoriesViewComponent } from './features/products/categories-view/categories-view.component';
import { CartViewComponent } from './features/cart-view/cart-view.component';
import { ShippingComponent } from './features/cart-view/shipping/shipping.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';

const routes: Routes = [
  { path: 'products', component: ProductsViewComponent },
  { path: 'categories', component: CategoriesViewComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'wishlist', component: WishlistViewComponent },
  {
    path: 'cart', component: CartViewComponent, children: [
      { path: 'shipping', component: ShippingComponent },
      // { path: 'overview', component: OverviewComponent },
      // { path: 'payment', component: PaymentComponent },
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: '404', component: NotFoundComponent },
  { path: 'home', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
  { path: '**', redirectTo: '/404', pathMatch: 'full' }, // Redirect to 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
