import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Product, parseStoredProducts } from '../features/products/Product';

export interface CartLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

const CART_KEY = 'cart';
const QUANTITIES_KEY = 'cartQuantities';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems$ = new BehaviorSubject<Product[]>([]);
  private quantities$ = new BehaviorSubject<number[]>([]);
  cartItems = this.cartItems$.asObservable();

  constructor() {
    try {
      const cart = parseStoredProducts(localStorage.getItem(CART_KEY));
      this.cartItems$.next(cart);
      this.quantities$.next(this.loadQuantities(cart.length));
    } catch (error) {
      console.error('Failed to load cart items from localStorage:', error);
      this.cartItems$.next([]);
      this.quantities$.next([]);
    }
  }

  addToCart(item: Product): void {
    const currentItems = [...this.cartItems$.value, item];
    const currentQuantities = [...this.quantities$.value, 1];

    try {
      localStorage.setItem(CART_KEY, JSON.stringify(currentItems));
      this.persistQuantities(currentQuantities);
      this.cartItems$.next(currentItems);
    } catch (error) {
      console.error('Failed to save cart items to localStorage:', error);
    }
  }

  removeFromCart(item: Product): void {
    const currentItems = this.cartItems$.value;
    const currentQuantities = this.quantities$.value;
    const newItems: Product[] = [];
    const newQuantities: number[] = [];

    for (let i = 0; i < currentItems.length; i++) {
      if (currentItems[i].id !== item.id) {
        newItems.push(currentItems[i]);
        newQuantities.push(currentQuantities[i] ?? 1);
      }
    }

    try {
      localStorage.setItem(CART_KEY, JSON.stringify(newItems));
      this.persistQuantities(newQuantities);
      this.cartItems$.next(newItems);
    } catch (error) {
      console.error('Failed to save cart items to localStorage:', error);
    }
  }

  getCartItems(): Observable<Product[]> {
    return this.cartItems;
  }

  getCartLines(): Observable<CartLine[]> {
    return combineLatest([this.cartItems$, this.quantities$]).pipe(
      map(([products, quantities]) =>
        products.map((product, index) => {
          const quantity = quantities[index] ?? 1;
          return {
            product,
            quantity,
            lineTotal: product.price * quantity,
          };
        })
      )
    );
  }

  getQuantities(): number[] {
    return [...this.quantities$.value];
  }

  setQuantityAtIndex(index: number, quantity: number): void {
    const quantities = [...this.quantities$.value];
    if (index < 0 || index >= quantities.length) {
      return;
    }
    quantities[index] = Math.max(1, quantity);
    this.persistQuantities(quantities);
  }

  getTotalPrice(): Observable<number> {
    return combineLatest([this.cartItems$, this.quantities$]).pipe(
      map(([products, quantities]) =>
        products.reduce(
          (total, product, index) => total + product.price * (quantities[index] ?? 1),
          0
        )
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

  getProductIndex(productId: number): number {
    return this.cartItems$.value.findIndex((product) => product.id === productId);
  }

  private loadQuantities(cartLength: number): number[] {
    try {
      const stored = localStorage.getItem(QUANTITIES_KEY);
      if (!stored) {
        return Array(cartLength).fill(1);
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return Array(cartLength).fill(1);
      }
      const quantities = parsed.map((value) =>
        typeof value === 'number' && value >= 1 ? value : 1
      );
      while (quantities.length < cartLength) {
        quantities.push(1);
      }
      return quantities.slice(0, cartLength);
    } catch (error) {
      console.error('Failed to load cart quantities from localStorage:', error);
      return Array(cartLength).fill(1);
    }
  }

  private persistQuantities(quantities: number[]): void {
    try {
      localStorage.setItem(QUANTITIES_KEY, JSON.stringify(quantities));
      this.quantities$.next(quantities);
    } catch (error) {
      console.error('Failed to save cart quantities to localStorage:', error);
    }
  }
}
