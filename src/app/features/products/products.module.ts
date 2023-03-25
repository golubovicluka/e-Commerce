import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProductsViewComponent } from './products-view.component';
import { ProductComponent } from './product/product.component';
import { FiltersComponent } from './filters/filters.component';

import { FormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
@NgModule({
  declarations: [
    ProductsViewComponent,
    ProductComponent,
    FiltersComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    AccordionModule,
    CheckboxModule
  ],
  exports: [
    ProductsViewComponent
  ]
})
export class ProductsModule { }
