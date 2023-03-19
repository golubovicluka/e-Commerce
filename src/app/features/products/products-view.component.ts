import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Product } from './Product';
import { ProductsService } from './products.service';
import { SubscriptionContainer } from './SubscriptionContainer';

@Component({
  selector: 'app-products-view',
  templateUrl: './products-view.component.html',
  styleUrls: ['./products-view.component.scss']
})
export class ProductsView implements OnInit, OnDestroy {
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
    this.subs?.dispose()
  }

}
