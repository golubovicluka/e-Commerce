import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductDetailsComponent } from './features/products/product/product-details/product-details.component';
import { ProductsViewComponent } from './features/products/products-view.component';

const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductsViewComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'home', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
