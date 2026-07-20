import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, DecimalPipe } from '@angular/common';
import { ProductsService } from '../../products.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { NavigationItem } from 'src/app/shared/navigation-item';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { Product } from '../../Product';
import { CartService } from 'src/app/shared/cart.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import {
  DEFAULT_MONTHLY_PAYMENT,
  getInstallmentAmount,
  MONTHLY_PAYMENT_OPTIONS,
  MonthlyPaymentOption,
} from 'src/app/shared/pricing';
import { FormsModule } from '@angular/forms';
import { ProductComponent } from '../product.component';
import { take } from 'rxjs';
import { BreadcrumbComponent } from 'src/app/shared/breadcrumb/breadcrumb.component';

@Component({
    selector: 'app-product-details',
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BreadcrumbComponent, FormsModule, ProductComponent, DecimalPipe]
})
export class ProductDetailsComponent implements OnInit {
  images!: string[];
  product: any | null = null;
  id!: number;

  selectedMonthlyPayment: MonthlyPaymentOption = DEFAULT_MONTHLY_PAYMENT;
  monthlyPaymentOptions = MONTHLY_PAYMENT_OPTIONS;

  suggestedProducts!: any[];

  public items!: NavigationItem[];
  home!: NavigationItem;

  inWishlist!: boolean;

  activeIndex: number = 0;


  constructor(
    private activatedRoute: ActivatedRoute,
    private _location: Location,
    private router: Router,
    private _productService: ProductsService,
    private _wishlistService: WishlistService,
    private _cartService: CartService,
    private _messageService: NotificationService,
    private _productImageService: ProductImageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { product: any };
    if (state?.product) {
      this.applyProduct(state.product);
      this.loadSuggestedProducts(state.product.category?.name);
    }
  }

  ngOnInit() {
    this.id = Number(this.activatedRoute.snapshot.params['id']);

    // If user navigated manually to the route
    if (!this.product) {
      this._productService.getProductById(this.id).pipe(take(1)).subscribe({
        next: (response: any) => {
          const product = response.data.product[0];
          if (!product) {
            this.router.navigate(['/404']);
            return;
          }
          this.applyProduct(product);
          this.loadSuggestedProducts(product.category?.name);
        },
        error: () => {
          this._messageService.add({
            severity: 'error',
            summary: 'Product unavailable',
            detail: 'We could not load this product. Please try again later.',
          });
          this.changeDetectorRef.markForCheck();
        },
      });
      this.inWishlist = this.checkInWishlist(this.id);
    }

    // Breadcrumbs setup
    this.setBreadcrumbItems();
    this.home = { icon: 'pi pi-home', routerLink: '/home' };
  }

  /** Kept as part of the component's public API for existing integrations. */
  getNumVisible(): number {
    const width = window.innerWidth;
    if (width <= 560) return 1;
    if (width <= 768) return 2;
    return 3;
  }

  navigateBack() {
    this._location.back();
  }

  checkInWishlist(id: number) {
    return this._wishlistService.inWishlist(id)
  }

  addProductToWishList(product: Product) {
    const itemInWishList = this.checkInWishlist(product.id);
    if (!itemInWishList) {
      this.addToWishList(product);
      this.inWishlist = true;
      this._messageService.add({ severity: 'success', summary: 'Added', detail: 'Added to wishlist' })
    } else {
      this.removedFromWishList(product);
      this.inWishlist = false;
      this._messageService.add({ severity: 'info', summary: 'Removed', detail: 'Removed from wishlist' })
    }
  }

  addToWishlist(product: Product) {
    this.addToWishList(product);
  }

  removeFromWishlist(product: Product) {
    this.removedFromWishList(product);
  }

  addToCart(product: Product) {
    this._cartService.addToCart(product);
  }

  removeFromCart(product: Product) {
    this._cartService.removeFromCart(product);
  }

  addToWishList(product: Product) {
    this._wishlistService.addWishListItem(product);
  }

  removedFromWishList(product: Product) {
    this._wishlistService.removeWishListItem(product);
  }

  checkIfInWishlist(product: Product) {
    return this._wishlistService.inWishlist(product.id);
  }

  openProductDetails(id: number) {
    this.router.navigate(['/product', id]);
  }

  getInstallmentAmount = getInstallmentAmount;

  setBreadcrumbItems() {
    this.items = [
      { label: 'Products', routerLink: '/products/search' },
      {
        label: this.product?.name ?? 'Product details',
        routerLink: `/product/${this.product?.id ?? this.id}`
      }
    ];
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  replaceProduct(id: number) {
    const newProduct = this.suggestedProducts.find((p) => p.id === id);
    if (!newProduct) {
      return;
    }

    this.applyProduct(newProduct);
    this.router.navigate(['/product', newProduct.id]);
    this.scrollToTop();
  }

  buyProduct(product: Product) {
    this._cartService.addToCart(product);
    this.router.navigate(['/cart'])
  }

  imageClick(index: number) {
    this.activeIndex = index;
  }

  onGalleryImageError(event: Event, imageIndex: number): void {
    const imageElement = event.target as HTMLImageElement | null;
    this._productImageService.handleImageError(event, this.product?.name);
    if (imageElement?.src) {
      this.images[imageIndex] = imageElement.src;
    }
  }

  protected readonly scrollY = scrollY;

  private applyProduct(product: Product): void {
    this.id = product.id;
    this.product = { ...product };
    this.images = this._productImageService.normalizeImages(product.images, product.name);
    this.product.images = this.images;
    this.inWishlist = this.checkInWishlist(this.id);
    this.setBreadcrumbItems();
    this.changeDetectorRef.markForCheck();
  }

  private loadSuggestedProducts(category?: string): void {
    if (!category) {
      this.suggestedProducts = [];
      this.changeDetectorRef.markForCheck();
      return;
    }

    this._productService.getProductsByCategory(category).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.suggestedProducts = response.data.product
          .filter((suggestedProduct: Product) => suggestedProduct.id !== this.id)
          .map((suggestedProduct: Product) => ({
            ...suggestedProduct,
            images: this._productImageService.normalizeImages(
              suggestedProduct.images,
              suggestedProduct.name,
            ),
          }));
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.suggestedProducts = [];
        this.changeDetectorRef.markForCheck();
      },
    });
  }
}
