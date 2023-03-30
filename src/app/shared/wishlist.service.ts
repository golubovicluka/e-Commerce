import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, of } from 'rxjs';
import { Product } from '../features/products/Product';
import { ProductComponent } from '../features/products/product/product.component';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishListItems$ = new BehaviorSubject<Product[]>([]);
  private wishListItems = this.wishListItems$.asObservable();

  constructor() {
    this.getWishListItems();
  }

  getWishListItems(): Observable<Product[]> {
    const wishList = localStorage.getItem('wishlist')
    const wishListItems = wishList ? JSON.parse(wishList) : []
    // Convert this to the same type as the type storing items into local storage
    console.log(wishListItems);
    return of(wishListItems);
  }

  // TODO: fix the way that wishlist items are mapped into local storage and retrieve them via getWishListItems()
  addWishListItem(product: Product) {
    this.wishListItems$.next([...this.wishListItems$.getValue(), product]);
    const products = this.wishListItems$.getValue();
    const wishListItems = products.map((product) => ({ ...product }))
    console.log('wishListItems ', wishListItems);
    localStorage.setItem("wishlist", JSON.stringify(wishListItems, this.getCircularReplacer()))
  }

  removeWishListItem(item: any) {
    this.wishListItems$.pipe(filter(wishListItem => wishListItem !== item))
    this.wishListItems$.next(this.wishListItems$.getValue().filter((wishListItem) => wishListItem !== item));
  }

  getCircularReplacer() {
    const seen = new WeakSet();
    return (key: any, value: any) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };



}
