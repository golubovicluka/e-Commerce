import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductDetailsComponent } from './features/products/product/product-details/product-details.component';
import { ProductsViewComponent } from './features/products/products-view.component';
import { WishlistViewComponent } from './features/wishlist/wishlist-view.component';
import { CategoriesViewComponent } from './features/products/categories-view/categories-view.component';
import { CartViewComponent } from './features/cart-view/cart-view.component';
import { ShippingComponent } from './features/cart-view/shipping/shipping.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { OverviewComponent } from './features/cart-view/overview/overview.component';
import { PaymentComponent } from './features/cart-view/payment/payment.component';

const routes: Routes = [
  { path: 'products/search', component: ProductsViewComponent },
  { path: 'categories', component: CategoriesViewComponent },
  { path: 'product/:id', component: ProductDetailsComponent },
  { path: 'wishlist', component: WishlistViewComponent },
  {
    path: 'cart', component: CartViewComponent, children: [
      { path: 'shipping', component: ShippingComponent },
      { path: 'overview', component: OverviewComponent },
      { path: 'payment', component: PaymentComponent },
    ]
  },
  { path: '404', component: NotFoundComponent },
  { path: 'home', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
  { path: '**', redirectTo: '/products/search', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
