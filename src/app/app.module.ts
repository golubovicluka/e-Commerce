import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { ProductsService } from './features/products/products.service';
import { RouterModule } from '@angular/router';
import { MainLayoutComponent } from './features/main-layout/main-layout.component';

// Feature modules
import { ProductsModule } from './features/products/products.module';
import { HeaderComponent } from './features/main-layout/header/header.component';
@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    RouterModule,
    CommonModule,
    ProductsModule
  ],
  providers: [ProductsService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
