import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Product } from './Product';
import { ProductsService } from './products.service';
import { SubscriptionContainer } from './SubscriptionContainer';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  products$: Subscription | undefined;
  subs = new SubscriptionContainer();

  constructor(private _productService: ProductsService) { }

  ngOnInit() {
    this.products$ = this._productService.getProducts().subscribe((products) => {
      console.log(products);
    })
    this.subs.add(this.products$);
  }

  ngOnDestroy() {
    this.subs.dispose()
  }

}
