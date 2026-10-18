import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from 'src/app/shared/notification.service';
import { Product, Subcategory, Category } from '../Product';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { getInstallmentAmount } from 'src/app/shared/pricing';
import { DecimalPipe, NgClass } from '@angular/common';


@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DecimalPipe, NgClass, RouterLink]
})
export class ProductComponent {
  @Input() name!: string;
  @Input() description!: string;
  @Input() subcategory!: Subcategory | undefined;
  @Input() category!: Category | undefined;
  @Input() categoryId!: number;
  @Input() subcategoryId!: number;
  @Input() images!: string[];
  @Input() EAN!: number;
  @Input() id!: number;
  @Input() inStock!: number;
  @Input() price!: number;
  @Input() isListView!: boolean;
  @Input() wishlistView?: boolean;
  @Input() priority = false;

  @Output() addedToWishList = new EventEmitter();
  @Output() removedFromWishList = new EventEmitter();
  @Output() addedToCart = new EventEmitter();
  @Output() removedFromCart = new EventEmitter();

  constructor(
    private _messageService: NotificationService,
    private _wishlistService: WishlistService,
    private _cartService: CartService,
    private _productImageService: ProductImageService
  ) {}

  get inWishlist(): boolean {
    return this._wishlistService.inWishlist(this.id);
  }

  get inCart(): boolean {
    return this._cartService.inCart(this.id);
  }

  get product(): Product {
    return {
      name: this.name,
      description: this.description,
      category: this.category,
      subcategory: this.subcategory,
      categoryId: this.categoryId,
      subcategoryId: this.subcategoryId,
      images: this._productImageService.normalizeImages(this.images, this.name),
      EAN: this.EAN,
      id: this.id,
      inStock: this.inStock,
      price: this.price,
    };
  }

  addRemoveItemWishlist(product: Product) {
    if (this.inWishlist) {
      this.removedFromWishList.emit(product);
      this._messageService.add({ severity: 'info', summary: 'Removed', detail: 'Removed from wishlist' });
    } else {
      this.addedToWishList.emit(product);
      this._messageService.add({ severity: 'success', summary: 'Added', detail: 'Added to wishlist' });
    }
  }

  addRemoveCartItem(product: Product) {
    if (this.inCart) {
      this.removedFromCart.emit(product);
      this._messageService.add({ severity: 'info', summary: 'Removed', detail: 'Removed from cart' });
    } else {
      this.addedToCart.emit(product);
      this._messageService.add({ severity: 'success', summary: 'Added', detail: 'Added to cart' });
    }
  }

  getInstallmentAmount = getInstallmentAmount;

  get primaryImageSrc(): string {
    return this._productImageService.resolvePrimaryImage(this.images, this.name);
  }

  onImageError(event: Event): void {
    this._productImageService.handleImageError(event, this.name);
  }

}
