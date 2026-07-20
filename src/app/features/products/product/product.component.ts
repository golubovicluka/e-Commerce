import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/shared/notification.service';
import { Product, Subcategory, Category } from '../Product';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { getInstallmentAmount } from 'src/app/shared/pricing';
import { DecimalPipe } from '@angular/common';


@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DecimalPipe]
})
export class ProductComponent implements OnInit {
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


  @Output() addedToWishList = new EventEmitter();
  @Output() removedFromWishList = new EventEmitter();
  @Output() addedToCart = new EventEmitter();
  @Output() removedFromCart = new EventEmitter();
  @Output() replaceCurrentProduct = new EventEmitter<number>();

  inWishlist!: boolean;
  inCart!: boolean;
  public product!: Product;



  constructor(
    private _messageService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private _wishlistService: WishlistService,
    private _cartService: CartService,
    private _productImageService: ProductImageService
  ) {
    this.inWishlist = this.checkInWishlist(this.id);
    this.inCart = this.checkInCart(this.id);
  }

  ngOnInit() {
    this.images = this._productImageService.normalizeImages(this.images, this.name);

    this.product = {
      name: this.name,
      description: this.description,
      category: this.category,
      subcategory: this.subcategory,
      categoryId: this.categoryId,
      subcategoryId: this.subcategoryId,
      images: this.images,
      EAN: this.EAN,
      id: this.id,
      inStock: this.inStock,
      price: this.price
    }
    this.inWishlist = this.checkInWishlist(this.id);
    this.inCart = this.checkInCart(this.id);
  }

  addRemoveItemWishlist(product: Product) {
    this.inWishlist = !this.inWishlist;

    if (this.inWishlist) {
      this.addedToWishList.emit(product);
      this._messageService.add({ severity: 'success', summary: 'Added', detail: 'Added to wishlist' })
    } else {
      this.removedFromWishList.emit(product);
      this._messageService.add({ severity: 'info', summary: 'Removed', detail: 'Removed from wishlist' })
    }
  }

  // Check to see if item is in wishlist
  checkInWishlist(id: number) {
    return this._wishlistService.inWishlist(id)
  }

  checkInCart(id: number) {
    return this._cartService.inCart(id);
  }

  addRemoveCartItem(product: Product) {
    this.inCart = !this.inCart;

    if (this.inCart) {
      this.addedToCart.emit(product);
      this._messageService.add({ severity: 'success', summary: 'Added', detail: 'Added to cart' })
    } else {
      this.removedFromCart.emit(product);
      this._messageService.add({ severity: 'info', summary: 'Removed', detail: 'Removed from cart' })
    }
  }

  openProductDetails(id: number) {
    const currentRoute = this.route.snapshot.url.join('/');
    if (currentRoute.includes('products')) {
      const navigationExtras: NavigationExtras = {
        state: {
          product: this.product
        }
      }
      this.router.navigate(['/product', id], navigationExtras);
    } else {
      this.replaceCurrentProduct.emit(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
