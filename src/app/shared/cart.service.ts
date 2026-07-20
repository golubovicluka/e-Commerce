import { computed, Injectable, signal } from '@angular/core';
import { map, Observable, startWith, Subject } from 'rxjs';
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
  private readonly cartItemsState = signal<Product[]>([]);
  private readonly quantitiesState = signal<number[]>([]);
  private readonly cartChanges$ = new Subject<void>();

  readonly cartItemsSignal = this.cartItemsState.asReadonly();
  readonly cartLinesSignal = computed(() =>
    this.cartItemsState().map((product, index) => {
      const quantity = this.quantitiesState()[index] ?? 1;
      return { product, quantity, lineTotal: product.price * quantity };
    }),
  );
  readonly totalPriceSignal = computed(() =>
    this.cartLinesSignal().reduce((total, line) => total + line.lineTotal, 0),
  );
  readonly numberOfItemsSignal = computed(() => this.cartItemsState().length);
  /** Observable compatibility facade; signals remain the single source of truth. */
  readonly cartItems = this.getCartItems();

  constructor() {
    try {
      const cart = parseStoredProducts(localStorage.getItem(CART_KEY));
      this.cartItemsState.set(cart);
      this.quantitiesState.set(this.loadQuantities(cart.length));
    } catch (error) {
      console.error('Failed to load cart items from localStorage:', error);
      this.cartItemsState.set([]);
      this.quantitiesState.set([]);
    }
  }

  addToCart(item: Product): void {
    const currentItems = [...this.cartItemsState()];
    const currentQuantities = [...this.quantitiesState()];
    const existingIndex = currentItems.findIndex((product) => product.id === item.id);

    if (existingIndex >= 0) {
      currentQuantities[existingIndex] = (currentQuantities[existingIndex] ?? 1) + 1;
    } else {
      currentItems.push(item);
      currentQuantities.push(1);
    }

    try {
      localStorage.setItem(CART_KEY, JSON.stringify(currentItems));
      localStorage.setItem(QUANTITIES_KEY, JSON.stringify(currentQuantities));
      this.setCartState(currentItems, currentQuantities);
    } catch (error) {
      console.error('Failed to save cart items to localStorage:', error);
    }
  }

  removeFromCart(item: Product): void {
    const currentItems = this.cartItemsState();
    const currentQuantities = this.quantitiesState();
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
      localStorage.setItem(QUANTITIES_KEY, JSON.stringify(newQuantities));
      this.setCartState(newItems, newQuantities);
    } catch (error) {
      console.error('Failed to save cart items to localStorage:', error);
    }
  }

  getCartItems(): Observable<Product[]> {
    return this.cartChanges$.pipe(
      startWith(undefined),
      map(() => this.cartItemsState()),
    );
  }

  getCartLines(): Observable<CartLine[]> {
    return this.cartChanges$.pipe(
      startWith(undefined),
      map(() => this.cartLinesSignal()),
    );
  }

  getQuantities(): number[] {
    return [...this.quantitiesState()];
  }

  setQuantityAtIndex(index: number, quantity: number): void {
    const quantities = [...this.quantitiesState()];
    if (index < 0 || index >= quantities.length) {
      return;
    }
    quantities[index] = Math.max(1, quantity);
    this.persistQuantities(quantities);
  }

  getTotalPrice(): Observable<number> {
    return this.cartChanges$.pipe(
      startWith(undefined),
      map(() => this.totalPriceSignal()),
    );
  }

  getNumberOfItems(): Observable<number> {
    return this.cartChanges$.pipe(
      startWith(undefined),
      map(() => this.numberOfItemsSignal()),
    );
  }

  inCart(id: number): boolean {
    return this.cartItemsState().some(product => product.id === id);
  }

  getProductIndex(productId: number): number {
    return this.cartItemsState().findIndex((product) => product.id === productId);
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
      this.quantitiesState.set(quantities);
      this.cartChanges$.next();
    } catch (error) {
      console.error('Failed to save cart quantities to localStorage:', error);
    }
  }

  private setCartState(items: Product[], quantities: number[]): void {
    this.cartItemsState.set(items);
    this.quantitiesState.set(quantities);
    this.cartChanges$.next();
  }
}
