import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { ProductsService } from '../products/products.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { SuggestedProductComponent } from './suggested-product/suggested-product.component';
import { FormsModule } from '@angular/forms';
import { NotificationService } from 'src/app/shared/notification.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, SuggestedProductComponent, FormsModule]
})
export class HomeComponent implements OnInit {
  private readonly featuredProducts = signal({
    iphone: {
      image: '',
      name: 'iPhone 14 Pro Max',
      description: '6.7″ 120 Hz OLED, A16 Bionic, 48 MP camera.',
    },
    macbook: {
      image: '',
      name: 'MacBook Pro M1',
      description: 'Apple silicon. All-day battery. 13″ Retina.',
    },
    ipad: {
      image: '',
      name: 'iPad Pro M2',
      description: 'Apple Pencil hover, ProRes capture, Wi‑Fi 6E.',
    },
  });
  private readonly suggestedProductsState = signal<any[]>([]);
  private readonly suggestedProductsLoadStateSignal = signal<'loading' | 'ready' | 'error'>('loading');

  iphoneId = 4;
  macbookId = 1;
  ipadId = 13;

  newsletterEmail = '';
  newsletterSubmitted = false;

  constructor(
    private router: Router,
    private _productService: ProductsService,
    private _productImageService: ProductImageService,
    private _notificationService: NotificationService
  ) { }

  get iphoneImg(): string { return this.featuredProducts().iphone.image; }
  get iphoneName(): string { return this.featuredProducts().iphone.name; }
  get iphoneSub(): string { return this.featuredProducts().iphone.description; }
  get macbookImg(): string { return this.featuredProducts().macbook.image; }
  get macbookName(): string { return this.featuredProducts().macbook.name; }
  get macbookSub(): string { return this.featuredProducts().macbook.description; }
  get ipadImg(): string { return this.featuredProducts().ipad.image; }
  get ipadName(): string { return this.featuredProducts().ipad.name; }
  get ipadSub(): string { return this.featuredProducts().ipad.description; }
  get suggestedProducts(): any[] { return this.suggestedProductsState(); }
  get suggestedProductsLoadState(): 'loading' | 'ready' | 'error' {
    return this.suggestedProductsLoadStateSignal();
  }

  ngOnInit() {
    this.setFeaturedFallback('macbook');
    this.setFeaturedFallback('ipad');
    this.setFeaturedFallback('iphone');
    this.loadFeaturedProducts();

    this._productService.getSuggestedProducts().pipe(take(1)).subscribe({
      next: (products: any) => {
        this.suggestedProductsState.set(products.data.product.map((product: any) => ({
          ...product,
          images: this._productImageService.normalizeImages(product.images, product.name)
        })));
        this.suggestedProductsLoadStateSignal.set('ready');
      },
      error: () => {
        this.suggestedProductsLoadStateSignal.set('error');
      },
    });
  }

  private loadFeaturedProducts(): void {
    const featuredIds = [this.macbookId, this.ipadId, this.iphoneId];
    this._productService
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
      this.updateFeaturedProduct('macbook', image, product.name, description);
      return;
    }

    if (slot === 'ipad') {
      this.updateFeaturedProduct('ipad', image, product.name, description);
      return;
    }

    this.updateFeaturedProduct('iphone', image, product.name, description);
  }

  private updateFeaturedProduct(
    slot: 'macbook' | 'ipad' | 'iphone',
    image: string,
    name: string,
    description?: string,
  ): void {
    this.featuredProducts.update((featured) => ({
      ...featured,
      [slot]: {
        image,
        name,
        description: description || featured[slot].description,
      },
    }));
  }

  private setFeaturedFallback(slot: 'macbook' | 'ipad' | 'iphone'): void {
    if (slot === 'macbook') {
      this.updateFeaturedProduct(
        slot,
        this._productImageService.getFallbackImageByName(this.macbookName),
        this.macbookName,
      );
      return;
    }
    if (slot === 'ipad') {
      this.updateFeaturedProduct(
        slot,
        this._productImageService.getFallbackImageByName(this.ipadName),
        this.ipadName,
      );
      return;
    }
    this.updateFeaturedProduct(
      slot,
      this._productImageService.getFallbackImageByName(this.iphoneName),
      this.iphoneName,
    );
  }

  submitForm() {
    const email = this.newsletterEmail?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this._notificationService.add({
        severity: 'warn',
        summary: 'Invalid email',
        detail: 'Please enter a valid email address.'
      });
      return;
    }

    this.newsletterSubmitted = true;
    this.newsletterEmail = '';
    this._notificationService.add({
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

}
