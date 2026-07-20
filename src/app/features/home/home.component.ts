import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription, take } from 'rxjs';
import { ProductsService } from '../products/products.service';
import { ProductImageService } from 'src/app/shared/product-image.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  iphoneImg = '';
  iphoneId = 4;
  iphoneName = 'iPhone 14 Pro Max';
  iphoneSub = '6.7″ 120 Hz OLED, A16 Bionic, 48 MP camera.';

  macbookImg = '';
  macbookId = 1;
  macbookName = 'MacBook Pro M1';
  macbookSub = 'Apple silicon. All-day battery. 13″ Retina.';

  ipadImg = '';
  ipadId = 13;
  ipadName = 'iPad Pro M2';
  ipadSub = 'Apple Pencil hover, ProRes capture, Wi‑Fi 6E.';

  suggestedProducts!: any;
  suggestedProductsLoadState: 'loading' | 'ready' | 'error' = 'loading';
  suggestedProductsSubscription!: Subscription;
  featuredProductsSubscription!: Subscription;

  newsletterEmail = '';
  newsletterSubmitted = false;

  carouselResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '480px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  constructor(
    private router: Router,
    private _productService: ProductsService,
    private _productImageService: ProductImageService,
    private _messageService: MessageService
  ) { }

  ngOnInit() {
    this.setFeaturedFallback('macbook');
    this.setFeaturedFallback('ipad');
    this.setFeaturedFallback('iphone');
    this.loadFeaturedProducts();

    this.suggestedProductsSubscription = this._productService.getSuggestedProducts().subscribe({
      next: (products: any) => {
        this.suggestedProducts = products.data.product.map((product: any) => ({
          ...product,
          images: this._productImageService.normalizeImages(product.images, product.name)
        }));
        this.suggestedProductsLoadState = 'ready';
      },
      error: () => {
        this.suggestedProductsLoadState = 'error';
      },
    });
  }

  private loadFeaturedProducts(): void {
    const featuredIds = [this.macbookId, this.ipadId, this.iphoneId];
    this.featuredProductsSubscription = this._productService
      .getProductsByIds(featuredIds)
      .pipe(take(1))
      .subscribe((result: any) => {
        const products: any[] = result.data?.product ?? [];
        const byId = new Map(products.map((product) => [product.id, product]));

        this.applyFeaturedProduct(byId.get(this.macbookId), 'macbook');
        this.applyFeaturedProduct(byId.get(this.ipadId), 'ipad');
        this.applyFeaturedProduct(byId.get(this.iphoneId), 'iphone');
      });
  }

  private applyFeaturedProduct(product: any | undefined, slot: 'macbook' | 'ipad' | 'iphone'): void {
    if (!product) {
      this.setFeaturedFallback(slot);
      return;
    }

    const image = this._productImageService.resolvePrimaryImage(product.images, product.name);
    const description = product.description?.trim();

    if (slot === 'macbook') {
      this.macbookImg = image;
      this.macbookName = product.name;
      if (description) {
        this.macbookSub = description;
      }
      return;
    }

    if (slot === 'ipad') {
      this.ipadImg = image;
      this.ipadName = product.name;
      if (description) {
        this.ipadSub = description;
      }
      return;
    }

    this.iphoneImg = image;
    this.iphoneName = product.name;
    if (description) {
      this.iphoneSub = description;
    }
  }

  private setFeaturedFallback(slot: 'macbook' | 'ipad' | 'iphone'): void {
    if (slot === 'macbook') {
      this.macbookImg = this._productImageService.getFallbackImageByName(this.macbookName);
      return;
    }
    if (slot === 'ipad') {
      this.ipadImg = this._productImageService.getFallbackImageByName(this.ipadName);
      return;
    }
    this.iphoneImg = this._productImageService.getFallbackImageByName(this.iphoneName);
  }

  submitForm() {
    const email = this.newsletterEmail?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this._messageService.add({
        severity: 'warn',
        summary: 'Invalid email',
        detail: 'Please enter a valid email address.'
      });
      return;
    }

    this.newsletterSubmitted = true;
    this.newsletterEmail = '';
    this._messageService.add({
      severity: 'success',
      summary: "You're on the list",
      detail: 'Thanks for signing up — watch your inbox for new arrivals.'
    });
  }

  redirect(id: number) {
    this.router.navigate(['/product', id]);
  }

  onHeroImageError(event: Event, productName: string) {
    this._productImageService.handleImageError(event, productName);
  }

  ngOnDestroy() {
    this.suggestedProductsSubscription?.unsubscribe();
    this.featuredProductsSubscription?.unsubscribe();
  }
}
