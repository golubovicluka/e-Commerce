import { DestroyRef, Injectable, signal } from '@angular/core';
import { parseStoredProducts, Product } from '../features/products/Product';

const WISHLIST_KEY = 'wishlist';

function uniqueProducts(products: Product[]): Product[] {
  return [...new Map(products.map((product) => [product.id, product])).values()];
}

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly wishlistState = signal<Product[]>([]);

  readonly wishListItemsSignal = this.wishlistState.asReadonly();

  private readonly handleStorageEvent = (event: StorageEvent): void => {
    if (event.key !== WISHLIST_KEY) {
      return;
    }

    this.setWishlistItems(uniqueProducts(parseStoredProducts(event.newValue)));
  };

  constructor(destroyRef: DestroyRef) {
    this.wishlistState.set(this.loadWishlist());
    window.addEventListener('storage', this.handleStorageEvent);
    destroyRef.onDestroy(() => window.removeEventListener('storage', this.handleStorageEvent));
  }

  inWishlist(id: number): boolean {
    return this.wishlistState().some((product) => product.id === id);
  }

  addWishListItem(item: Product): boolean {
    if (this.inWishlist(item.id)) {
      return false;
    }

    return this.persist([...this.wishlistState(), item]);
  }

  removeWishListItem(item: Product): boolean {
    const nextItems = this.wishlistState().filter((product) => product.id !== item.id);
    if (nextItems.length === this.wishlistState().length) {
      return false;
    }

    return this.persist(nextItems);
  }

  private loadWishlist(): Product[] {
    try {
      return uniqueProducts(parseStoredProducts(localStorage.getItem(WISHLIST_KEY)));
    } catch (error) {
      console.error('Failed to load wishlist items from localStorage:', error);
      return [];
    }
  }

  private persist(items: Product[]): boolean {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
      this.setWishlistItems(items);
      return true;
    } catch (error) {
      console.error('Failed to save wishlist items to localStorage:', error);
      return false;
    }
  }

  private setWishlistItems(items: Product[]): void {
    this.wishlistState.set(items);
  }
}
