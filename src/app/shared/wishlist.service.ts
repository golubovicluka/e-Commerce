import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product, parseStoredProducts } from '../features/products/Product';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishListItems$ = new BehaviorSubject<Product[]>([]);
  wishListItemsObservable = this.wishListItems$.asObservable();

  constructor() {
    try {
      this.wishListItems$.next(parseStoredProducts(localStorage.getItem('wishlist')));
    } catch (error) {
      console.error('Failed to load wishlist items from localStorage:', error);
      this.wishListItems$.next([]);
    }
  }

  getWishListItems(): Observable<Product[]> {
    return this.wishListItemsObservable;
  }

  inWishlist(id: number): boolean {
    return this.wishListItems$.value.some(product => product.id === id);
  }

  addWishListItem(item: Product): void {
    const currentItems = [...this.wishListItems$.value, item];

    try {
      localStorage.setItem('wishlist', JSON.stringify(currentItems));
      this.wishListItems$.next(currentItems);
    } catch (error) {
      console.error('Failed to save wishlist items to localStorage:', error);
    }
  }

  removeWishListItem(item: Product): void {
    const currentItems = this.wishListItems$.value.filter(product => product.id !== item.id);

    try {
      localStorage.setItem('wishlist', JSON.stringify(currentItems));
      this.wishListItems$.next(currentItems);
    } catch (error) {
      console.error('Failed to save wishlist items to localStorage:', error);
    }
  }
}

