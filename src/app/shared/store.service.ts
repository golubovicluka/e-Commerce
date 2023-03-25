import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private wishListItems$ = new BehaviorSubject<any[]>([]);

  constructor() { }

  getWishListItems(): Observable<any[]> {
    return this.wishListItems$;
  }

  addWishListItem(item: any[]) {
    this.wishListItems$.next([...this.wishListItems$.getValue(), item]);
  }

  removeWishListItem(item: any[]) {
    this.wishListItems$.pipe(filter(wishListItem => wishListItem !== item))
    this.wishListItems$.next(this.wishListItems$.getValue().filter((wishListItem) => wishListItem !== item));
  }

}
