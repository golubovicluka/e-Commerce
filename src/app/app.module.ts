import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core/core.module';
import { MainModule } from './features/main-layout/main.module';
import { ProductComponent } from './features/products/product/product.component';
import { ProductsService } from './features/products/products.service';
import { ProductsModule } from './features/products/products.module';
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [

    BrowserModule,
    AppRoutingModule,
    CoreModule,
    MainModule
  ],
  providers: [ProductsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
