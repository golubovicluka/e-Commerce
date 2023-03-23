import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsViewComponent } from './features/products/products-view.component';

const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductsViewComponent },
  { path: 'home', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
  // {
  //   path: '',
  //   loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule)
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
