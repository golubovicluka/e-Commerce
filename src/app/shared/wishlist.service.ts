import { Injectable, signal } from '@angular/core';
import { map, Observable, startWith, Subject } from 'rxjs';
import { Product, parseStoredProducts } from '../features/products/Product';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly wishListItemsState = signal<Product[]>([]);
  private readonly wishlistChanges$ = new Subject<void>();
  readonly wishListItemsSignal = this.wishListItemsState.asReadonly();
  readonly wishListItemsObservable = this.getWishListItems();

  constructor() {
    try {
      this.setWishlistItems(parseStoredProducts(localStorage.getItem('wishlist')));
    } catch (error) {
      console.error('Failed to load wishlist items from localStorage:', error);
      this.setWishlistItems([]);
    }
  }

  getWishListItems(): Observable<Product[]> {
    return this.wishlistChanges$.pipe(
      startWith(undefined),
      map(() => this.wishListItemsState()),
    );
  }

  inWishlist(id: number): boolean {
    return this.wishListItemsState().some(product => product.id === id);
  }

  addWishListItem(item: Product): void {
    const currentItems = [...this.wishListItemsState(), item];

    try {
      localStorage.setItem('wishlist', JSON.stringify(currentItems));
      this.setWishlistItems(currentItems);
    } catch (error) {
      console.error('Failed to save wishlist items to localStorage:', error);
    }
  }

  removeWishListItem(item: Product): void {
    const currentItems = this.wishListItemsState().filter(product => product.id !== item.id);

    try {
      localStorage.setItem('wishlist', JSON.stringify(currentItems));
      this.setWishlistItems(currentItems);
    } catch (error) {
      console.error('Failed to save wishlist items to localStorage:', error);
    }
  }

  private setWishlistItems(items: Product[]): void {
    this.wishListItemsState.set(items);
    this.wishlistChanges$.next();
  }
}
