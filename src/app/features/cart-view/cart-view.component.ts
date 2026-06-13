import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MenuItem, MessageService } from 'primeng/api';
import { Observable, of, Subscription } from 'rxjs';
import { CartService } from 'src/app/shared/cart.service';
import { ProductImageService } from 'src/app/shared/product-image.service';

import { Product } from '../products/Product';

@Component({
  selector: 'app-cart-view',
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.scss'],
})
export class CartViewComponent implements OnInit, OnDestroy {
  products$!: Observable<Product[]>;
  totalPrice$!: Observable<number>;

  pieces: number[] = [];
  numberOfItems!: number;
  shippingView = false;
  activeIndex: number = 1;

  selectedMonthlyPayment: any = { name: 12 };
  monthlyPaymentOptions: any[] = [{ name: 12 }, { name: 24 }, { name: 36 }];

  stepperItems!: MenuItem[];

  productsSubscription!: Subscription;
  public items!: MenuItem[];
  home!: MenuItem;
  shippingViewText!: 'Proceed with shipping' | 'Back to cart view';

  constructor(
    private _cartService: CartService,
    public messageService: MessageService,
    private router: Router,
    private _productImageService: ProductImageService
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

    this.totalPrice$ = this._cartService.getTotalPrice();

    this.productsSubscription = this._cartService
      .getCartItems()
      .subscribe((products) => {
        this.numberOfItems = products.length;
        this.products$ = of(products);
        this.pieces = this._cartService.getQuantities();
      });

    this.shippingViewText = 'Proceed with shipping';

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
    this.productsSubscription.unsubscribe();
  }

  incrementProductCount(index: number, itemsInStock: number) {
    if (this.pieces[index] < itemsInStock) {
      this.pieces[index]++;
      this._cartService.setQuantityAtIndex(index, this.pieces[index]);
    }
  }

  decrementProductCount(index: number) {
    if (this.pieces[index] > 1) {
      this.pieces[index]--;
      this._cartService.setQuantityAtIndex(index, this.pieces[index]);
    }
  }

  onQuantityChange(index: number, quantity: number): void {
    this.pieces[index] = quantity;
    this._cartService.setQuantityAtIndex(index, quantity);
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
  }

  openProductDetails(id: number) {
    this.router.navigate(['/product', id]);
  }

  getProductImage(product: Product): string {
    return this._productImageService.resolvePrimaryImage(product.images, product.name);
  }

  onProductImageError(event: Event, productName: string): void {
    this._productImageService.handleImageError(event, productName);
  }
}
