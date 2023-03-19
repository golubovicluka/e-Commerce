import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingRoutingModule } from './main-routing.module';
import { MainLayoutComponent } from './main-layout.component';



@NgModule({
  declarations: [
    MainLayoutComponent
  ],
  imports: [
    CommonModule,
    MainRoutingRoutingModule
  ],
  exports: [
    MainLayoutComponent
  ]
})
export class MainModule { }
