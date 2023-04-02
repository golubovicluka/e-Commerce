import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../features/products/Product';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems$ = new BehaviorSubject<Product[]>([]);
  cartItems = this.cartItems$.asObservable();

  constructor() {
    const cartItems = localStorage.getItem('cart');
    if (cartItems) {
      this.cartItems$.next(JSON.parse(cartItems));
    }
  }

  addToCart(item: Product) {
    const currentItems = [...this.cartItems$.value, item];

    localStorage.setItem('cart', JSON.stringify(currentItems));
    this.cartItems$.next(currentItems);
  }

  removeFromCart(item: Product) {
    let currentItems = this.cartItems$.value;
    currentItems = currentItems.filter(product => product.id !== item.id);
    localStorage.setItem('cart', JSON.stringify(currentItems));

    this.cartItems$.next(currentItems);
  }

  getCartItems(): Observable<Product[]> {
    return this.cartItems;
  }

  inCart(id: number) {
    return this.cartItems$.value.some(product => product.id === id);
  }

}
