import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, of } from 'rxjs';
import { Product } from '../features/products/Product';
import { ProductComponent } from '../features/products/product/product.component';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishListItems$ = new BehaviorSubject<Product[]>([]);
  wishListItemsObservable = this.wishListItems$.asObservable();

  constructor() {
    const wishList = localStorage.getItem('wishlist');
    if (wishList) {
      this.wishListItems$.next(JSON.parse(wishList));
    }
  }

  getWishListItems(): Observable<Product[]> {
    return this.wishListItemsObservable;
  }

  inWishlist(id: number): boolean {
    return this.wishListItems$.value.some(product => product.id === id);
  }

  addWishListItem(item: Product) {
    const currentItems = [...this.wishListItems$.value, item];

    localStorage.setItem('wishlist', JSON.stringify(currentItems));
    this.wishListItems$.next(currentItems);
  }

  removeWishListItem(item: Product) {
    let currentItems = this.wishListItems$.value;
    currentItems = currentItems.filter(product => product.id !== item.id);
    localStorage.setItem('wishlist', JSON.stringify(currentItems));

    this.wishListItems$.next(currentItems);
  }
}

