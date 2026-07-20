import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProductsService } from '../../products.service';
import { MenuItem, MessageService } from 'primeng/api';
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
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  images!: string[];
  product: any | null = null;
  id!: number;
  isLoading = false;
  notFound = false;

  selectedMonthlyPayment: MonthlyPaymentOption = DEFAULT_MONTHLY_PAYMENT;
  monthlyPaymentOptions = MONTHLY_PAYMENT_OPTIONS;

  suggestedProducts!: any[];

  public items!: MenuItem[];
  home!: MenuItem;

  private destroy$ = new Subject<void>();

  galleryResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3
    },
    {
      breakpoint: '768px',
      numVisible: 2
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  carouselResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 3
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  inWishlist!: boolean;
  displayCustom!: boolean;

  activeIndex: number = 0;


  constructor(
    private activatedRoute: ActivatedRoute,
    private _location: Location,
    private router: Router,
    private _productService: ProductsService,
    private _wishlistService: WishlistService,
    private _cartService: CartService,
    private _messageService: MessageService,
    private _productImageService: ProductImageService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { product: any };
    if (state?.product) {
      this.id = state?.product.id;
      this.inWishlist = this.checkInWishlist(this.id)
      this.product = state?.product;
      this.images = this._productImageService.normalizeImages(state?.product.images, state?.product.name);
      this.product.images = this.images;

      // Suggested products
      const productCategory = state?.product.category?.name;
      this._productService.getProductsByCategory(productCategory).subscribe((suggestedProducts: any) => {
        // TODO: filter out the currently selected item and remove it from suggestions list
        this.suggestedProducts = suggestedProducts.data.product
          .filter((suggestedProduct: Product) => suggestedProduct.id !== this.id)
          .map((suggestedProduct: Product) => ({
            ...suggestedProduct,
            images: this._productImageService.normalizeImages(suggestedProduct.images, suggestedProduct.name)
          }));
        // Undefined when user reload the page or goes directly to this route
      })
    }
  }

  ngOnInit() {
    this.home = { icon: 'pi pi-home', routerLink: '/home' };

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const nextId = Number(params.get('id'));
      if (!nextId || Number.isNaN(nextId)) {
        this.notFound = true;
        this.product = null;
        return;
      }

      if (this.id === nextId && this.product) {
        return;
      }

      this.id = nextId;
      this.loadProduct(this.id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(productId: number): void {
    this.isLoading = true;
    this.notFound = false;
    this.product = null;

    this._productService.getProductById(productId).subscribe({
      next: (response: any) => {
        const loadedProduct = response.data.product[0];
        if (!loadedProduct) {
          this.isLoading = false;
          this.notFound = true;
          return;
        }

        this.product = loadedProduct;
        this.images = this._productImageService.normalizeImages(loadedProduct.images, loadedProduct.name);
        this.product.images = this.images;
        this.inWishlist = this.checkInWishlist(productId);
        this.setBreadcrumbItems();
        this.isLoading = false;

        const productCategory = loadedProduct.category?.name;
        this._productService.getProductsByCategory(productCategory).subscribe((suggestedProducts: any) => {
          this.suggestedProducts = suggestedProducts.data.product
            .filter((suggestedProduct: Product) => suggestedProduct.id !== productId)
            .map((suggestedProduct: Product) => ({
              ...suggestedProduct,
              images: this._productImageService.normalizeImages(suggestedProduct.images, suggestedProduct.name)
            }));
        });
      },
      error: () => {
        this.isLoading = false;
        this.notFound = true;
      }
    });
  }

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

  // TODO: fix add and remove from wishlist
  addToWishlist(product: Product) {
  }

  removeFromWishlist(product: Product) {
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

  // Move to service
  openProductDetails(id: number) {
    const product = {
      name: this.product.name,
      description: this.product.description,
      subcategory: this.product.subcategory,
      images: this.product.images,
      EAN: this.product.EAN,
      id,
      inStock: this.product.inStock,
      price: this.product.price
    }

    const navigationExtras: NavigationExtras = {
      state: {
        product
      }
    }
    this.router.navigate(['/product', id], navigationExtras);
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

    this.id = newProduct.id;
    this.inWishlist = this.checkIfInWishlist(newProduct);
    this.product = newProduct;
    this.images = this._productImageService.normalizeImages(newProduct.images, newProduct.name);
    this.product.images = this.images;
    this.setBreadcrumbItems();
    this.router.navigate(['/product', newProduct.id]);
  }

  buyProduct(product: Product) {
    this._cartService.addToCart(product);
    this.router.navigate(['/cart'])
  }

  imageClick(index: number) {
    this.activeIndex = index;
    this.displayCustom = true;
  }

  onGalleryImageError(event: Event, imageIndex: number): void {
    const imageElement = event.target as HTMLImageElement | null;
    this._productImageService.handleImageError(event, this.product?.name);
    if (imageElement?.src) {
      this.images[imageIndex] = imageElement.src;
    }
  }

  protected readonly scrollY = scrollY;
}
