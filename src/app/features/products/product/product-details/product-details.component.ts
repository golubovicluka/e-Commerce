import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GalleryModule } from 'primeng/gallery';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  map,
  of,
  startWith,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { BreadcrumbComponent } from 'src/app/shared/breadcrumb/breadcrumb.component';
import { CartService } from 'src/app/shared/cart.service';
import { NavigationItem } from 'src/app/shared/navigation-item';
import { NotificationService } from 'src/app/shared/notification.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import {
  DEFAULT_MONTHLY_PAYMENT,
  getInstallmentAmount,
  MONTHLY_PAYMENT_OPTIONS,
  MonthlyPaymentOption,
} from 'src/app/shared/pricing';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { Product } from '../../Product';
import { ProductsService } from '../../products.service';
import { ProductComponent } from '../product.component';

type ProductLoadState = 'loading' | 'ready' | 'error';
type SuggestionsLoadState = 'idle' | 'loading' | 'ready' | 'error';

type ProductLoadResult =
  | { kind: 'ready'; product: Product }
  | { kind: 'not-found' }
  | { kind: 'error' };

type SuggestionsResult =
  | { kind: 'ready'; products: Product[] }
  | { kind: 'error' };

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreadcrumbComponent, FormsModule, ProductComponent, DecimalPipe, GalleryModule],
})
export class ProductDetailsComponent implements OnInit {
  images: string[] = [];
  product: Product | null = null;
  id = 0;
  loadState: ProductLoadState = 'loading';

  selectedMonthlyPayment: MonthlyPaymentOption = DEFAULT_MONTHLY_PAYMENT;
  readonly monthlyPaymentOptions = MONTHLY_PAYMENT_OPTIONS;

  suggestedProducts: Product[] = [];
  suggestionsLoadState: SuggestionsLoadState = 'idle';

  items: NavigationItem[] = [];
  readonly home: NavigationItem = { icon: 'pi pi-home', routerLink: '/home' };

  inWishlist = false;
  activeIndex = 0;

  private readonly retryProductRequest = new Subject<void>();
  private readonly relatedProductsRequest = new Subject<{ category: string; productId: number }>();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly productsService: ProductsService,
    private readonly wishlistService: WishlistService,
    private readonly cartService: CartService,
    private readonly notificationService: NotificationService,
    private readonly productImageService: ProductImageService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.bindRelatedProducts();

    this.activatedRoute.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        map((id) => Number.isSafeInteger(id) && id > 0 ? id : null),
        distinctUntilChanged(),
        switchMap((id) => {
          if (id === null) {
            void this.router.navigate(['/404']);
            return EMPTY;
          }

          this.id = id;
          return this.retryProductRequest.pipe(
            startWith(undefined),
            tap(() => this.beginProductLoad()),
            switchMap(() => this.productsService.getProductById(id).pipe(
              map((response): ProductLoadResult => {
                const product = response.data?.product[0];
                return product ? { kind: 'ready', product } : { kind: 'not-found' };
              }),
              catchError(() => of<ProductLoadResult>({ kind: 'error' })),
            )),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => this.handleProductResult(result));
  }

  retryProductLoad(): void {
    this.retryProductRequest.next();
  }

  addProductToWishList(product: Product): void {
    const removing = this.wishlistService.inWishlist(product.id);
    const succeeded = removing
      ? this.wishlistService.removeWishListItem(product)
      : this.wishlistService.addWishListItem(product);

    if (!succeeded) {
      this.notificationService.add({
        severity: 'error',
        summary: 'Could not update wishlist',
        detail: 'Your browser could not save this change. Please try again.',
      });
      return;
    }

    this.inWishlist = !removing;
    this.notificationService.add({
      severity: removing ? 'info' : 'success',
      summary: removing ? 'Removed' : 'Added',
      detail: removing ? 'Removed from wishlist' : 'Added to wishlist',
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  removeFromCart(product: Product): void {
    this.cartService.removeFromCart(product);
  }

  addToWishList(product: Product): void {
    this.wishlistService.addWishListItem(product);
  }

  removedFromWishList(product: Product): void {
    this.wishlistService.removeWishListItem(product);
  }

  getInstallmentAmount = getInstallmentAmount;

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  replaceProduct(id: number): void {
    if (!this.suggestedProducts.some((product) => product.id === id)) {
      return;
    }

    void this.router.navigate(['/product', id]);
    this.scrollToTop();
  }

  buyProduct(product: Product): void {
    if (!this.cartService.addToCart(product)) {
      this.notificationService.add({
        severity: 'warn',
        summary: 'Could not add product',
        detail: 'The selected quantity is unavailable or the cart could not be saved.',
      });
      return;
    }

    void this.router.navigate(['/cart']);
  }

  onGalleryImageError(event: Event, imageIndex: number): void {
    const imageElement = event.target as HTMLImageElement | null;
    this.productImageService.handleImageError(event, this.product?.name);
    if (!imageElement?.src) {
      return;
    }

    this.images = this.images.map((image, index) =>
      index === imageIndex ? imageElement.src : image,
    );
    if (this.product) {
      this.product = { ...this.product, images: this.images };
    }
    this.changeDetectorRef.markForCheck();
  }

  private bindRelatedProducts(): void {
    this.relatedProductsRequest
      .pipe(
        tap(() => {
          this.suggestionsLoadState = 'loading';
          this.suggestedProducts = [];
        }),
        switchMap(({ category, productId }) =>
          this.productsService.getRelatedProducts(category, productId).pipe(
            take(1),
            map((response): SuggestionsResult => ({
              kind: 'ready',
              products: (response.data?.product ?? []).map((product) => ({
                ...product,
                images: this.productImageService.normalizeImages(product.images, product.name),
              })),
            })),
            catchError(() => of<SuggestionsResult>({ kind: 'error' })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.suggestionsLoadState = result.kind;
        this.suggestedProducts = result.kind === 'ready' ? result.products : [];
        this.changeDetectorRef.markForCheck();
      });
  }

  private beginProductLoad(): void {
    this.loadState = 'loading';
    this.product = null;
    this.images = [];
    this.suggestedProducts = [];
    this.suggestionsLoadState = 'idle';
    this.setBreadcrumbItems();
    this.changeDetectorRef.markForCheck();
  }

  private handleProductResult(result: ProductLoadResult): void {
    if (result.kind === 'not-found') {
      void this.router.navigate(['/404']);
      return;
    }

    if (result.kind === 'error') {
      this.loadState = 'error';
      this.notificationService.add({
        severity: 'error',
        summary: 'Product unavailable',
        detail: 'We could not load this product. Please try again later.',
      });
      this.changeDetectorRef.markForCheck();
      return;
    }

    this.applyProduct(result.product);
  }

  private applyProduct(product: Product): void {
    this.id = product.id;
    this.images = this.productImageService.normalizeImages(product.images, product.name);
    this.product = { ...product, images: this.images };
    this.activeIndex = 0;
    this.inWishlist = this.wishlistService.inWishlist(this.id);
    this.loadState = 'ready';
    this.setBreadcrumbItems();

    if (product.category?.name) {
      this.relatedProductsRequest.next({
        category: product.category.name,
        productId: product.id,
      });
    } else {
      this.suggestionsLoadState = 'ready';
      this.suggestedProducts = [];
    }
    this.changeDetectorRef.markForCheck();
  }

  private setBreadcrumbItems(): void {
    this.items = [
      { label: 'Products', routerLink: '/products/search' },
      {
        label: this.product?.name ?? 'Product details',
        routerLink: `/product/${this.product?.id ?? this.id}`,
      },
    ];
  }
}
