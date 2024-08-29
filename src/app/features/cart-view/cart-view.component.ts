import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MenuItem, MessageService } from 'primeng/api';
import { map, Observable, of, Subscription } from 'rxjs';
import { CartService } from 'src/app/shared/cart.service';

import { Product } from '../products/Product';

@Component({
  selector: 'app-cart-view',
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.scss'],
})
export class CartViewComponent implements OnInit {
  products$!: Observable<Product[]>;
  totalPrice$!: Observable<number>;

  pieces: number[] = [];
  numberOfItems!: number;
  shippingView = false;
  activeIndex: number = 1;

  selectedMonthlyPayment: any = { name: 12 };
  monthlyPaymentOptions: any[] = [{ name: 12 }, { name: 24 }, { name: 36 }];

  stepperItems!: MenuItem[];

  priceObservable!: Subscription;
  productsSubscription!: Subscription;
  public items!: MenuItem[];
  home!: MenuItem;
  shippingViewText!: 'Proceed with shipping' | 'Back to cart view';

  constructor(
    private _cartService: CartService,
    public messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.stepperItems = [
      {
        label: 'Shipping',
        routerLink: 'shipping',
      },
      {
        label: 'Overview',
        routerLink: 'overview',
      },
      {
        label: 'Payment',
        routerLink: 'payment',
      },
    ];

    this.productsSubscription = this._cartService
      .getCartItems()
      .subscribe((products) => {
        this.numberOfItems = products.length;
        this.products$ = of(products);
        
        this.pieces = products.map(() => 1);
      });

    this.shippingViewText = 'Proceed with shipping';

    this.priceObservable = this.getTotalPrice().subscribe((price) => {
      this.totalPrice$ = of(price);
    });

    this.items = [
      { label: 'Products', routerLink: '/products/search' },
      { label: 'Cart', routerLink: '/cart' },
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/home' };
  }

  onActiveIndexChange(event: any) {
    this.activeIndex = event;
  }

  ngOnDestroy() {
    this.priceObservable.unsubscribe();
    this.productsSubscription.unsubscribe();
  }

  incrementProductCount(index: number, itemsInStock: number) {
    if (this.pieces[index] < itemsInStock) {
      this.pieces[index]++;
      this.updateTotalPrice();
    }
  }

  decrementProductCount(index: number) {
    if (this.pieces[index] > 1) {
      this.pieces[index]--;
      this.updateTotalPrice();
    }
  }

  openShippingView() {
    this.shippingView = !this.shippingView;
    this.shippingView
      ? (this.shippingViewText = 'Back to cart view')
      : (this.shippingViewText = 'Proceed with shipping');
    this.router.navigate(['cart/shipping']);
  }

  getInstallmentPayAmount(price: number | null | undefined, months: any) {
    return Math.floor(price! / months);
  }

  removeFromCart(product: Product) {
    this._cartService.removeFromCart(product);
    this.priceObservable = this.getTotalPrice().subscribe(
      (price) => (this.totalPrice$ = of(price))
    );
  }

  getTotalPrice() {
    return this.products$.pipe(
      map((products) =>
        products.reduce((total, product, index) => 
          total + (product.price * this.pieces[index] || 0), 0)
      )
    );
  }

  openProductDetails(id: number) {
    this.router.navigate(['/product', id]);
  }

  updateTotalPrice() {
    this.priceObservable = this.getTotalPrice().subscribe((price) => {
      this.totalPrice$ = of(price);
    });
  }
}
