import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet, RouterLink } from '@angular/router';

import { NavigationItem } from 'src/app/shared/navigation-item';
import { filter, Observable, Subscription } from 'rxjs';
import { CartLine, CartService } from 'src/app/shared/cart.service';
import {
  DEFAULT_MONTHLY_PAYMENT,
  getInstallmentAmount,
  MONTHLY_PAYMENT_OPTIONS,
  MonthlyPaymentOption,
} from 'src/app/shared/pricing';
import { ProductImageService } from 'src/app/shared/product-image.service';

import { Product } from '../products/Product';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { BreadcrumbComponent } from 'src/app/shared/breadcrumb/breadcrumb.component';

@Component({
    selector: 'app-cart-view',
    templateUrl: './cart-view.component.html',
    styleUrls: ['./cart-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BreadcrumbComponent, FormsModule, RouterOutlet, RouterLink, DecimalPipe]
})
export class CartViewComponent implements OnInit, OnDestroy {
  readonly cartLines$: Observable<CartLine[]> = this._cartService.getCartLines();
  readonly totalPrice$: Observable<number> = this._cartService.getTotalPrice();
  readonly cartLines = toSignal(this.cartLines$, { initialValue: [] });
  readonly totalPrice = toSignal(this.totalPrice$, { initialValue: 0 });
  private readonly cartItemsState = toSignal(this._cartService.getCartItems(), {
    initialValue: [],
  });

  private readonly checkoutActiveState = signal(false);
  private readonly activeIndexState = signal(0);

  selectedMonthlyPayment: MonthlyPaymentOption = DEFAULT_MONTHLY_PAYMENT;
  monthlyPaymentOptions = MONTHLY_PAYMENT_OPTIONS;

  stepperItems!: NavigationItem[];

  private routerSubscription!: Subscription;
  public items!: NavigationItem[];
  home!: NavigationItem;

  constructor(
    private _cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private _productImageService: ProductImageService
  ) {}

  get numberOfItems(): number {
    return this.cartItemsState().length;
  }

  get checkoutActive(): boolean {
    return this.checkoutActiveState();
  }

  set checkoutActive(value: boolean) {
    this.checkoutActiveState.set(value);
  }

  get activeIndex(): number {
    return this.activeIndexState();
  }

  set activeIndex(value: number) {
    this.activeIndexState.set(value);
  }

  ngOnInit() {
    this.stepperItems = [
      { label: 'Shipping', routerLink: 'shipping' },
      { label: 'Overview', routerLink: 'overview' },
      { label: 'Payment', routerLink: 'payment' },
    ];

    this.updateCheckoutState();
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.updateCheckoutState());

    this.items = [
      { label: 'Products', routerLink: '/products/search' },
      { label: 'Cart', routerLink: '/cart' },
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/home' };
  }

  get checkoutCtaLabel(): 'Proceed with shipping' | 'Back to cart view' {
    return this.checkoutActive ? 'Back to cart view' : 'Proceed with shipping';
  }

  onActiveIndexChange(index: number) {
    this.activeIndex = index;
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  incrementProductCount(productId: number, itemsInStock: number, quantity: number) {
    if (quantity < itemsInStock) {
      const index = this._cartService.getProductIndex(productId);
      if (index >= 0) {
        this._cartService.setQuantityAtIndex(index, quantity + 1);
      }
    }
  }

  decrementProductCount(productId: number, quantity: number) {
    if (quantity > 1) {
      const index = this._cartService.getProductIndex(productId);
      if (index >= 0) {
        this._cartService.setQuantityAtIndex(index, quantity - 1);
      }
    }
  }

  onQuantityChange(productId: number, quantity: number): void {
    const index = this._cartService.getProductIndex(productId);
    if (index >= 0) {
      this._cartService.setQuantityAtIndex(index, quantity);
    }
  }

  openShippingView() {
    if (this.checkoutActive) {
      this.router.navigate(['/cart']);
      return;
    }
    this.router.navigate(['/cart/shipping']);
  }

  getInstallmentAmount = getInstallmentAmount;

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

  trackByProductId(_index: number, line: CartLine): number {
    return line.product.id;
  }

  private updateCheckoutState(): void {
    const childPath = this.route.firstChild?.snapshot.url[0]?.path;
    this.checkoutActive = !!childPath;

    const stepByPath: Record<string, number> = {
      shipping: 0,
      overview: 1,
      payment: 2,
    };
    this.activeIndex = childPath ? stepByPath[childPath] ?? 0 : 0;
  }
}
