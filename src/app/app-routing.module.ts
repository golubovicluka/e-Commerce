import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { ProductDetailsComponent } from './features/products/product/product-details/product-details.component';
import { ProductsViewComponent } from './features/products/products-view.component';
import { WishlistViewComponent } from './features/wishlist/wishlist-view.component';

const routes: Routes = [
  // { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductsViewComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'wishlist', component: WishlistViewComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
