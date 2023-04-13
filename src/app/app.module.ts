import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { ProductsService } from './features/products/products.service';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Apollo
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular'
import { HttpLink } from 'apollo-angular/http';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { InMemoryCache } from '@apollo/client/core';

// Feature modules
import { ProductsModule } from './features/products/products.module';
import { HeaderComponent } from './features/main-layout/header/header.component';

// PrimeNG modules
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { BreadcrumbModule } from 'primeng/breadcrumb';

import { WishlistService } from './shared/wishlist.service';
import { LoginComponent } from './features/login/login.component';
import { WishlistViewComponent } from './features/wishlist/wishlist-view.component';
import { ToastModule } from 'primeng/toast';
import { CartViewComponent } from './features/cart-view/cart-view.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { StepsModule } from 'primeng/steps';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ShippingComponent } from './features/cart-view/shipping/shipping.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { FooterComponent } from './features/main-layout/footer/footer.component';
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    WishlistViewComponent,
    CartViewComponent,
    ShippingComponent,
    NotFoundComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    RouterModule,
    CommonModule,
    FormsModule,
    SharedModule,
    ProductsModule,
    HttpClientModule,
    ApolloModule,
    BadgeModule,
    InputTextareaModule,
    CheckboxModule,
    BrowserAnimationsModule,
    ButtonModule,
    InputTextModule,
    BreadcrumbModule,
    ToastModule,
    InputNumberModule,
    DividerModule,
    DropdownModule,
    StepsModule
  ],
  exports: [
  ],
  providers: [
    WishlistService,
    ProductsService,
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink) {
        return {
          cache: new InMemoryCache(),
          link: httpLink.create({
            uri: 'https://webshop.hasura.app/v1/graphql',
            headers: new HttpHeaders({
              "x-hasura-admin-secret": "6sftAV4UtDQ6V26v1p4U4mDAS8eXiDDnBo62JFsQbdTjksQQjcF54reBmrA2p7Jl"
            }),
          }),
        };
      },
      deps: [HttpLink],
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
