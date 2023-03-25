import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from './Product';
import { ProductsService } from './products.service';
import { SubscriptionContainer } from './SubscriptionContainer';

@Component({
  selector: 'app-products-view',
  templateUrl: './products-view.component.html',
  styleUrls: ['./products-view.component.scss'],
})
export class ProductsViewComponent implements OnInit, OnDestroy {
  products$!: Observable<any>
  subs = new SubscriptionContainer();
  selectedCategory: string = "Phone";

  constructor(private _productService: ProductsService) { }

  ngOnInit() {
    this._productService.getProducts().subscribe((products: any) => {
      console.log(products.data.product);
      this.products$ = of(products.data.product);
    });
    this._productService.getProductByCategory(this.selectedCategory).subscribe((products) => {
      console.log(`Products in category ${this.selectedCategory}: `, products);
    })
  }

  trackByProductId(index: number, product: Product): number {
    return index;
  }

  ngOnDestroy() {
    this.subs?.dispose()
  }

}
