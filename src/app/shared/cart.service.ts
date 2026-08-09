import { computed, DestroyRef, Injectable, signal } from '@angular/core';
import { Product, isProduct, parseStoredProducts } from '../features/products/Product';

export interface CartLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

interface StoredCartLine {
  product: Product;
  quantity: number;
}

interface StoredCartV1 {
  version: 1;
  lines: StoredCartLine[];
}

const CART_KEY = 'cart';
const LEGACY_QUANTITIES_KEY = 'cartQuantities';

function normalizeQuantity(value: unknown, available: number): number | null {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    return null;
  }

  return Math.min(value, Math.max(1, available));
}

function isStoredCart(value: unknown): value is StoredCartV1 {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (candidate['version'] !== 1 || !Array.isArray(candidate['lines'])) {
    return false;
  }

  return candidate['lines'].every((line) => {
    if (typeof line !== 'object' || line === null) {
      return false;
    }

    const storedLine = line as Record<string, unknown>;
    return isProduct(storedLine['product']) && normalizeQuantity(
      storedLine['quantity'],
      storedLine['product'].inStock,
    ) !== null;
  });
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly cartState = signal<StoredCartLine[]>([]);

  readonly cartItemsSignal = computed(() => this.cartState().map(({ product }) => product));
  readonly cartLinesSignal = computed<CartLine[]>(() =>
    this.cartState().map(({ product, quantity }) => ({
      product,
      quantity,
      lineTotal: product.price * quantity,
    })),
  );
  readonly totalPriceSignal = computed(() =>
    this.cartLinesSignal().reduce((total, line) => total + line.lineTotal, 0),
  );
  readonly numberOfItemsSignal = computed(() =>
    this.cartState().reduce((total, line) => total + line.quantity, 0),
  );

  private readonly handleStorageEvent = (event: StorageEvent): void => {
    if (event.key !== CART_KEY) {
      return;
    }

    this.setCartState(this.parseCart(event.newValue));
  };

  constructor(destroyRef: DestroyRef) {
    this.cartState.set(this.loadCart());
    window.addEventListener('storage', this.handleStorageEvent);
    destroyRef.onDestroy(() => window.removeEventListener('storage', this.handleStorageEvent));
  }

  addToCart(item: Product): boolean {
    if (item.inStock < 1) {
      return false;
    }

    const nextState = this.cartState().map((line) => ({ ...line }));
    const existingLine = nextState.find((line) => line.product.id === item.id);

    if (existingLine) {
      if (existingLine.quantity >= item.inStock) {
        return false;
      }
      existingLine.quantity += 1;
      existingLine.product = item;
    } else {
      nextState.push({ product: item, quantity: 1 });
    }

    return this.persist(nextState);
  }

  removeFromCart(item: Product): boolean {
    const nextState = this.cartState().filter((line) => line.product.id !== item.id);
    if (nextState.length === this.cartState().length) {
      return false;
    }

    return this.persist(nextState);
  }

  setQuantity(productId: number, quantity: number): boolean {
    const currentState = this.cartState();
    const index = currentState.findIndex(({ product }) => product.id === productId);
    const line = currentState[index];
    if (!line) {
      return false;
    }

    const normalizedQuantity = normalizeQuantity(quantity, line.product.inStock);
    if (normalizedQuantity === null) {
      return false;
    }

    if (normalizedQuantity === line.quantity) {
      return true;
    }

    const nextState = currentState.map((item, itemIndex) =>
      itemIndex === index ? { ...item, quantity: normalizedQuantity } : item,
    );
    return this.persist(nextState);
  }

  inCart(id: number): boolean {
    return this.cartState().some(({ product }) => product.id === id);
  }

  private loadCart(): StoredCartLine[] {
    try {
      const storedCart = localStorage.getItem(CART_KEY);
      const parsedCart = this.parseCart(storedCart);

      if (storedCart && !this.isLegacyCart(storedCart)) {
        return parsedCart;
      }

      const legacyProducts = parseStoredProducts(storedCart);
      if (legacyProducts.length === 0) {
        return [];
      }

      const legacyQuantities = this.loadLegacyQuantities(legacyProducts);
      const migratedState = legacyProducts.map((product, index) => ({
        product,
        quantity: legacyQuantities[index],
      }));

      if (this.writeStorage(migratedState)) {
        localStorage.removeItem(LEGACY_QUANTITIES_KEY);
      }
      return migratedState;
    } catch (error) {
      console.error('Failed to load cart items from localStorage:', error);
      return [];
    }
  }

  private parseCart(raw: string | null): StoredCartLine[] {
    if (!raw) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isStoredCart(parsed)) {
        return [];
      }

      return parsed.lines.map(({ product, quantity }) => ({
        product,
        quantity: normalizeQuantity(quantity, product.inStock)!,
      }));
    } catch {
      return [];
    }
  }

  private isLegacyCart(raw: string): boolean {
    try {
      return Array.isArray(JSON.parse(raw));
    } catch {
      return false;
    }
  }

  private loadLegacyQuantities(products: Product[]): number[] {
    try {
      const raw = localStorage.getItem(LEGACY_QUANTITIES_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) {
        return products.map(() => 1);
      }

      return products.map((product, index) =>
        normalizeQuantity(parsed[index], product.inStock) ?? 1,
      );
    } catch {
      return products.map(() => 1);
    }
  }

  private persist(lines: StoredCartLine[]): boolean {
    if (!this.writeStorage(lines)) {
      return false;
    }

    this.setCartState(lines);
    return true;
  }

  private writeStorage(lines: StoredCartLine[]): boolean {
    const storedCart: StoredCartV1 = { version: 1, lines };
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(storedCart));
      return true;
    } catch (error) {
      console.error('Failed to save cart items to localStorage:', error);
      return false;
    }
  }

  private setCartState(lines: StoredCartLine[]): void {
    this.cartState.set(lines);
  }
}
