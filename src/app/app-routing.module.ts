import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsView } from './features/products/products-view.component';

const routes: Routes = [
  { path: "", component: ProductsView },
  { path: 'main-routing', loadChildren: () => import('./features/main-layout/main.module').then(m => m.MainModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
