import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsViewComponent } from '../products/products-view.component';
import { MainLayoutComponent } from './main-layout.component';


const routes: Routes = [
  { path: '', component: ProductsViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingRoutingModule { }
