import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { SuggestedProductComponent } from './suggested-product/suggested-product.component';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  declarations: [
    HomeComponent,
    SuggestedProductComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ButtonModule,
    CarouselModule,
    ChipModule,
    InputTextModule
  ]
})
export class HomeModule { }
