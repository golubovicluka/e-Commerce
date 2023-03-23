import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProductsViewComponent } from './products-view.component';
import { ProductComponent } from './product/product.component';

@NgModule({
  declarations: [
    ProductsViewComponent,
    ProductComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ProductsViewComponent
  ]
})
export class ProductsModule { }
