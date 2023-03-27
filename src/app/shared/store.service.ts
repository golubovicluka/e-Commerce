import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { ProductComponent } from '../features/products/product/product.component';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private wishListItems$ = new BehaviorSubject<any[]>([]);

  constructor() { }

  // TODO: Fix this - smelly code
  getWishListItems(): Observable<any[]> {
    let localStorageWishlist = localStorage.getItem('wishlist');
    return this.wishListItems$;
  }

  // TODO: fix the way that wishlist items are mapped into local storage and retrieve them at getWishListItems()
  addWishListItem(item: any[]) {
    this.wishListItems$.next([...this.wishListItems$.getValue(), item]);
    const products = this.wishListItems$.getValue();
    const wishListItems = products.map((product) => ({ ...product }))
    console.log('wishListItems ', wishListItems);
    localStorage.setItem("wishlist", JSON.stringify(wishListItems, this.getCircularReplacer()))
  }

  // To avoid
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

  removeWishListItem(item: any[]) {
    this.wishListItems$.pipe(filter(wishListItem => wishListItem !== item))
    this.wishListItems$.next(this.wishListItems$.getValue().filter((wishListItem) => wishListItem !== item));
  }

}
