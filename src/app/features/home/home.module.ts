import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { SuggestedProductComponent } from './suggested-product/suggested-product.component';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    HomeComponent,
    SuggestedProductComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HomeRoutingModule,
    ButtonModule,
    CarouselModule,
    ChipModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class HomeModule { }
