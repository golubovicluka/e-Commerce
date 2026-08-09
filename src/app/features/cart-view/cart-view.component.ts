import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { BreadcrumbComponent } from 'src/app/shared/breadcrumb/breadcrumb.component';
import { CartService } from 'src/app/shared/cart.service';
import { NavigationItem } from 'src/app/shared/navigation-item';
import {
  DEFAULT_MONTHLY_PAYMENT,
  getInstallmentAmount,
  MONTHLY_PAYMENT_OPTIONS,
  MonthlyPaymentOption,
} from 'src/app/shared/pricing';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { Product } from '../products/Product';

@Component({
  selector: 'app-cart-view',
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreadcrumbComponent, FormsModule, RouterOutlet, RouterLink, DecimalPipe],
})
export class CartViewComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly checkoutActiveState = signal(false);
  private readonly activeIndexState = signal(0);

  readonly cartLines = this.cartService.cartLinesSignal;
  readonly totalPrice = this.cartService.totalPriceSignal;
  readonly monthlyPaymentOptions = MONTHLY_PAYMENT_OPTIONS;
  readonly stepperItems: readonly NavigationItem[] = [
    { label: 'Shipping', routerLink: 'shipping' },
    { label: 'Overview', routerLink: 'overview' },
    { label: 'Payment', routerLink: 'payment' },
  ];
  readonly items: readonly NavigationItem[] = [
    { label: 'Products', routerLink: '/products/search' },
    { label: 'Cart', routerLink: '/cart' },
  ];
  readonly home: NavigationItem = { icon: 'pi pi-home', routerLink: '/home' };
  readonly getInstallmentAmount = getInstallmentAmount;

  selectedMonthlyPayment: MonthlyPaymentOption = DEFAULT_MONTHLY_PAYMENT;

  constructor(
    private readonly cartService: CartService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly productImageService: ProductImageService,
  ) {}

  get numberOfItems(): number {
    return this.cartService.numberOfItemsSignal();
  }

  get checkoutActive(): boolean {
    return this.checkoutActiveState();
  }

  get activeIndex(): number {
    return this.activeIndexState();
  }

  get checkoutCtaLabel(): 'Preview shipping details' | 'Back to cart' {
    return this.checkoutActive ? 'Back to cart' : 'Preview shipping details';
  }

  ngOnInit(): void {
    this.updateCheckoutState();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.updateCheckoutState());
  }

  incrementProductCount(productId: number, itemsInStock: number, quantity: number): void {
    if (quantity < itemsInStock) {
      this.cartService.setQuantity(productId, quantity + 1);
    }
  }

  decrementProductCount(productId: number, quantity: number): void {
    if (quantity > 1) {
      this.cartService.setQuantity(productId, quantity - 1);
    }
  }

  onQuantityChange(productId: number, quantity: number): void {
    this.cartService.setQuantity(productId, quantity);
  }

  openShippingView(): void {
    void this.router.navigate([this.checkoutActive ? '/cart' : '/cart/shipping']);
  }

  removeFromCart(product: Product): void {
    this.cartService.removeFromCart(product);
  }

  getProductImage(product: Product): string {
    return this.productImageService.resolvePrimaryImage(product.images, product.name);
  }

  onProductImageError(event: Event, productName: string): void {
    this.productImageService.handleImageError(event, productName);
  }

  private updateCheckoutState(): void {
    const childPath = this.route.firstChild?.snapshot.url[0]?.path;
    this.checkoutActiveState.set(Boolean(childPath));

    const stepByPath: Record<string, number> = {
      shipping: 0,
      overview: 1,
      payment: 2,
    };
    this.activeIndexState.set(childPath ? (stepByPath[childPath] ?? 0) : 0);
  }
}
