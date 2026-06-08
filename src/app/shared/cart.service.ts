import { Injectable } from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import { Product, parseStoredProducts } from '../features/products/Product';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems$ = new BehaviorSubject<Product[]>([]);
  cartItems = this.cartItems$.asObservable();

  constructor() {
    try {
      this.cartItems$.next(parseStoredProducts(localStorage.getItem('cart')));
    } catch (error) {
      console.error('Failed to load cart items from localStorage:', error);
      this.cartItems$.next([]);
    }
  }

  addToCart(item: Product): void {
    const currentItems = [...this.cartItems$.value, item];

    try {
      localStorage.setItem('cart', JSON.stringify(currentItems));
      this.cartItems$.next(currentItems);
    } catch (error) {
      console.error('Failed to save cart items to localStorage:', error);
    }
  }

  removeFromCart(item: Product): void {
    const currentItems = this.cartItems$.value.filter(product => product.id !== item.id);

    try {
      localStorage.setItem('cart', JSON.stringify(currentItems));
      this.cartItems$.next(currentItems);
    } catch (error) {
      console.error('Failed to save cart items to localStorage:', error);
    }
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

  inCart(id: number): boolean {
    return this.cartItems$.value.some(product => product.id === id);
  }

}
