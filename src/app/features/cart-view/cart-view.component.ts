import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CartService } from 'src/app/shared/cart.service';
import { Product } from '../products/Product';
import { Observable, Subscription, map, of } from 'rxjs';

@Component({
  selector: 'app-cart-view',
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.scss']
})
export class CartViewComponent implements OnInit {
  products$!: Observable<Product[]>;
  totalPrice$!: Observable<number>;

  pieces: any = 1;
  numberOfItems!: number;

  // TODO: refactor to use SubscriptionContainer
  priceObservable!: Subscription;
  productsSubscription!: Subscription;
  public items!: MenuItem[];
  home!: MenuItem;

  constructor(
    private _cartService: CartService
  ) { }

  ngOnInit() {
    this.productsSubscription = this._cartService.getCartItems().subscribe((products) => {
      console.log(products);
      this.numberOfItems = products.length;
      this.products$ = of(products)
    })
    // Calculate total amount in cart
    this.priceObservable = this.getTotalPrice().subscribe(price => this.totalPrice$ = of(price));

    this.items = [
      { label: 'Products', routerLink: '/products' },
      { label: 'Cart', routerLink: '/cart' },
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/home' };
  }

  ngOnDestroy() {
    this.priceObservable.unsubscribe();
    this.productsSubscription.unsubscribe();
  }

  incrementProductCount() {
    this.pieces++;
  }

  decrementProductCount() {
    this.pieces--;
  }

  removeFromCart(product: Product) {
    this._cartService.removeFromCart(product);
    this.priceObservable = this.getTotalPrice().subscribe(price => this.totalPrice$ = of(price));
  }

  getTotalPrice() {
    return this.products$.pipe(
      map(products => products.reduce((total, product) => total + product.price, 0))
    );
  }

}
