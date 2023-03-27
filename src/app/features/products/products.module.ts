import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProductsViewComponent } from './products-view.component';
import { ProductComponent } from './product/product.component';
import { FiltersComponent } from './filters/filters.component';

import { FormsModule } from '@angular/forms';
import { SharedModule, MessageService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ProductDetailsComponent } from './product/product-details/product-details.component';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@NgModule({
  declarations: [
    ProductsViewComponent,
    ProductComponent,
    FiltersComponent,
    ProductDetailsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    AccordionModule,
    CheckboxModule,
    ToastModule,
    InputTextModule,
    BreadcrumbModule
  ],
  exports: [
    ProductsViewComponent
  ],
  providers: [MessageService]
})
export class ProductsModule { }
