import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product, parseStoredProducts } from '../features/products/Product';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishListItems$ = new BehaviorSubject<Product[]>([]);
  private readonly wishListItemsState = signal<Product[]>([]);
  wishListItemsObservable = this.wishListItems$.asObservable();
  readonly wishListItemsSignal = this.wishListItemsState.asReadonly();

  constructor() {
    try {
      this.setWishlistItems(parseStoredProducts(localStorage.getItem('wishlist')));
    } catch (error) {
      console.error('Failed to load wishlist items from localStorage:', error);
      this.setWishlistItems([]);
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
      this.setWishlistItems(currentItems);
    } catch (error) {
      console.error('Failed to save wishlist items to localStorage:', error);
    }
  }

  removeWishListItem(item: Product): void {
    const currentItems = this.wishListItems$.value.filter(product => product.id !== item.id);

    try {
      localStorage.setItem('wishlist', JSON.stringify(currentItems));
      this.setWishlistItems(currentItems);
    } catch (error) {
      console.error('Failed to save wishlist items to localStorage:', error);
    }
  }

  private setWishlistItems(items: Product[]): void {
    this.wishListItems$.next(items);
    this.wishListItemsState.set(items);
  }
}
