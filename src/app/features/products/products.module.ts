import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProductsViewComponent } from './products-view.component';
import { ProductComponent } from './product/product.component';
import { FiltersComponent } from './filters/filters.component';

import { FormsModule } from '@angular/forms';
import { SharedModule, MessageService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ProductDetailsComponent } from './product/product-details/product-details.component';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { ImageModule } from 'primeng/image';
import { CarouselModule } from 'primeng/carousel';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { CategoriesViewComponent } from './categories-view/categories-view.component';
import { CategoryComponent } from './categories-view/category/category.component';
import { StepsModule } from 'primeng/steps';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { InputTextareaModule } from 'primeng/inputtextarea';

@NgModule({
  declarations: [
    ProductsViewComponent,
    ProductComponent,
    FiltersComponent,
    ProductDetailsComponent,
    CategoriesViewComponent,
    CategoryComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    SharedModule,
    AccordionModule,
    CheckboxModule,
    InputTextModule,
    BreadcrumbModule,
    ButtonModule,
    GalleriaModule,
    DataViewModule,
    DropdownModule,
    TooltipModule,
    ImageModule,
    CarouselModule,
    PaginatorModule,
    TagModule,
    SliderModule,
    InputTextareaModule,
    InputNumberModule,
    SkeletonModule,
    StepsModule,
    ToastModule
  ],
  exports: [
    ProductsViewComponent,
    ProductComponent
  ],
  providers: [MessageService]
})
export class ProductsModule { }
