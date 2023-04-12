import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
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
  shippingView = false;
  activeIndex: number = 1;

  // Monthly payment options
  selectedMonthlyPayment: any = { name: 12 }
  monthlyPaymentOptions: any[] = [
    { name: 12 },
    { name: 24 },
    { name: 36 },
  ];

  stepperItems!: MenuItem[];

  // TODO: refactor to use SubscriptionContainer
  priceObservable!: Subscription;
  productsSubscription!: Subscription;
  public items!: MenuItem[];
  home!: MenuItem;

  constructor(
    private _cartService: CartService,
    public messageService: MessageService
  ) { }

  ngOnInit() {
    this.stepperItems = [{
      label: 'Shipping',
      routerLink: 'shipping'
    },
    {
      label: 'Payment',
      routerLink: 'payment'
    },
    {
      label: 'Confirmation',
      routerLink: 'confirmation',
    },
    ];

    this.productsSubscription = this._cartService.getCartItems().subscribe((products) => {
      console.log(products);
      this.numberOfItems = products.length;
      this.products$ = of(products)
    })

    // Calculate total amount in cart
    this.priceObservable = this.getTotalPrice().subscribe(price => {
      this.totalPrice$ = of(price)
    });

    this.items = [
      { label: 'Products', routerLink: '/products' },
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

  incrementProductCount(itemsInStock: number) {
    if (this.pieces < itemsInStock) this.pieces++;
  }

  decrementProductCount() {
    if (this.pieces > 1) this.pieces--;
  }

  // TODO: create Shipping - Overview - Payment stepper && guard to check if user is logged in
  openShippingView() {
    this.shippingView = !this.shippingView;
  }

  getInstallmentPayAmount(price: number | null | undefined, months: any) {
    console.log(price, months);
    return Math.floor(price! / months);
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
