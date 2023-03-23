import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { Product } from './Product';
import { ProductsService } from './products.service';
import { SubscriptionContainer } from './SubscriptionContainer';

@Component({
  selector: 'app-products-view',
  templateUrl: './products-view.component.html',
  styleUrls: ['./products-view.component.scss'],
})
export class ProductsViewComponent implements OnInit, OnDestroy {
  products$!: Observable<Product[]>
  // products$: Subscription | undefined;
  subs = new SubscriptionContainer();

  constructor(private _productService: ProductsService) { }

  ngOnInit() {
    setTimeout(() => {
      this.products$ = this._productService.getProducts()
    }, 3000);
    // this.subs.add(this.products$);
  }

  trackByProductId(index: number, product: Product): number {
    return index;
  }

  ngOnDestroy() {
    this.subs?.dispose()
  }

}
