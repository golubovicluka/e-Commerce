import { Injectable } from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import { Product } from '../features/products/Product';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems$ = new BehaviorSubject<Product[]>([]);
  cartItems = this.cartItems$.asObservable();

  constructor() {
    const cartItems = localStorage.getItem('cart');
    if (cartItems) this.cartItems$.next(JSON.parse(cartItems));
  }

  addToCart(item: Product) {
    const currentItems = [...this.cartItems$.value, item];
    const serializedItems = JSON.stringify(currentItems);

    try {
      localStorage.setItem('cart', serializedItems);
    } catch (error) {
      console.error('Failed to save cart items to localStorage:', error);
      return;
    }

    this.cartItems$.next(currentItems);
  }

  removeFromCart(item: Product) {
    const currentItems = this.cartItems$.value.filter(product => product?.id !== item?.id);
    localStorage.setItem('cart', JSON.stringify(currentItems));
    this.cartItems$.next(currentItems);
  }

  getCartItems(): Observable<Product[]> {
    return this.cartItems;
  }

  getTotalPrice(): Observable<number> {
    return this.cartItems$.pipe(
      map((products) =>
        products.reduce((total, product) => total + product.price, 0)
      )
    );
  }

  getNumberOfItems(): Observable<number> {
    return this.cartItems$.pipe(
      map((products) => products.length)
    );
  }

  inCart(id: number) {
    return this.cartItems$.value.some(product => product.id === id);
  }

}
