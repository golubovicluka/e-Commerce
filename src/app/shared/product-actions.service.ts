import { computed, Injectable } from '@angular/core';
import { Product } from '../features/products/Product';
import { CartService } from './cart.service';
import { NotificationService } from './notification.service';
import { WishlistService } from './wishlist.service';

@Injectable({ providedIn: 'root' })
export class ProductActionsService {
  private readonly cartProductIds = computed(() =>
    new Set(this.cartService.cartItemsSignal().map((product) => product.id)),
  );
  private readonly wishlistProductIds = computed(() =>
    new Set(this.wishlistService.wishListItemsSignal().map((product) => product.id)),
  );

  constructor(
    private readonly cartService: CartService,
    private readonly wishlistService: WishlistService,
    private readonly notifications: NotificationService,
  ) {}

  inCart(productId: number): boolean {
    return this.cartProductIds().has(productId);
  }

  inWishlist(productId: number): boolean {
    return this.wishlistProductIds().has(productId);
  }

  toggleCart(product: Product): boolean {
    const removing = this.inCart(product.id);
    const succeeded = removing
      ? this.cartService.removeFromCart(product)
      : this.cartService.addToCart(product);

    if (!succeeded) {
      this.notifications.add({
        severity: 'error',
        summary: 'Could not update cart',
        detail: 'The item is unavailable or your browser could not save the cart.',
      });
      return false;
    }

    this.notifications.add({
      severity: removing ? 'info' : 'success',
      summary: removing ? 'Removed' : 'Added',
      detail: removing ? 'Removed from cart' : 'Added to cart',
    });
    return true;
  }

  addToCart(product: Product): boolean {
    const succeeded = this.cartService.addToCart(product);
    if (!succeeded) {
      this.notifications.add({
        severity: 'warn',
        summary: 'Could not add product',
        detail: 'The selected quantity is unavailable or the cart could not be saved.',
      });
      return false;
    }

    this.notifications.add({
      severity: 'success',
      summary: 'Added',
      detail: 'Added to cart',
    });
    return true;
  }

  toggleWishlist(product: Product): boolean {
    const removing = this.inWishlist(product.id);
    const succeeded = removing
      ? this.wishlistService.removeWishListItem(product)
      : this.wishlistService.addWishListItem(product);

    if (!succeeded) {
      this.notifications.add({
        severity: 'error',
        summary: 'Could not update wishlist',
        detail: 'Your browser could not save this change. Please try again.',
      });
      return false;
    }

    this.notifications.add({
      severity: removing ? 'info' : 'success',
      summary: removing ? 'Removed' : 'Added',
      detail: removing ? 'Removed from wishlist' : 'Added to wishlist',
    });
    return true;
  }
}
