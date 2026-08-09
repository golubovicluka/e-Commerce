import { TestBed } from '@angular/core/testing';
import { createMockProduct, mockProducts } from '../testing/mock-data';
import { CartService } from './cart.service';

interface StorageMock extends Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'> {
  getItem: jest.Mock<string | null, [string]>;
  setItem: jest.Mock<void, [string, string]>;
  removeItem: jest.Mock<void, [string]>;
  clear: jest.Mock<void, []>;
}

describe('CartService', () => {
  let storage: Record<string, string>;
  let localStorageMock: StorageMock;

  const storedCart = (lines: Array<{ product: ReturnType<typeof createMockProduct>; quantity: number }>) =>
    JSON.stringify({ version: 1, lines });

  const createService = (): CartService => TestBed.inject(CartService);

  beforeEach(() => {
    storage = {};
    localStorageMock = {
      getItem: jest.fn((key: string) => storage[key] ?? null),
      setItem: jest.fn((key: string, value: string) => {
        storage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete storage[key];
      }),
      clear: jest.fn(() => {
        storage = {};
      }),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
    });

    TestBed.configureTestingModule({ providers: [CartService] });
  });

  it('starts with an empty cart and exposes empty derived state', () => {
    const service = createService();

    expect(service.cartItemsSignal()).toEqual([]);
    expect(service.cartLinesSignal()).toEqual([]);
    expect(service.totalPriceSignal()).toBe(0);
    expect(service.numberOfItemsSignal()).toBe(0);
    expect(service.getQuantities()).toEqual([]);
  });

  it('restores a versioned cart', () => {
    const product = createMockProduct({ inStock: 5 });
    storage['cart'] = storedCart([{ product, quantity: 3 }]);

    const service = createService();

    expect(service.cartLinesSignal()).toEqual([
      { product, quantity: 3, lineTotal: product.price * 3 },
    ]);
  });

  it.each([
    'null',
    JSON.stringify({ version: 2, lines: [] }),
    JSON.stringify({ version: 1, lines: {} }),
    JSON.stringify({ version: 1, lines: [null] }),
    JSON.stringify({ version: 1, lines: [{ product: {}, quantity: 1 }] }),
    storedCart([{ product: createMockProduct(), quantity: 0 }]),
    '{broken-json',
  ])('ignores invalid versioned storage: %s', (raw) => {
    storage['cart'] = raw;

    expect(createService().cartItemsSignal()).toEqual([]);
  });

  it('migrates the legacy products and quantities into one envelope', () => {
    const first = createMockProduct({ id: 1, inStock: 2 });
    const second = createMockProduct({ id: 2, inStock: 10 });
    storage['cart'] = JSON.stringify([first, second]);
    storage['cartQuantities'] = JSON.stringify([8, 'invalid']);

    const service = createService();

    expect(service.getQuantities()).toEqual([2, 1]);
    expect(JSON.parse(storage['cart'])).toEqual({
      version: 1,
      lines: [
        { product: first, quantity: 2 },
        { product: second, quantity: 1 },
      ],
    });
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('cartQuantities');
  });

  it.each([undefined, JSON.stringify({ quantity: 2 }), '{broken-json']) (
    'uses quantity one when legacy quantities are unavailable: %s',
    (quantities) => {
      storage['cart'] = JSON.stringify([mockProducts[0]]);
      if (quantities !== undefined) {
        storage['cartQuantities'] = quantities;
      }

      expect(createService().getQuantities()).toEqual([1]);
    },
  );

  it('keeps migrated state in memory when the migration write fails', () => {
    storage['cart'] = JSON.stringify([mockProducts[0]]);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage full');
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const service = createService();

    expect(service.cartItemsSignal()).toEqual([mockProducts[0]]);
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('recovers when storage access throws', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(createService().cartItemsSignal()).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('recovers when removing the migrated legacy key throws', () => {
    storage['cart'] = JSON.stringify([mockProducts[0]]);
    localStorageMock.removeItem.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(createService().cartItemsSignal()).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('adds products and increments an existing line up to available stock', () => {
    const service = createService();
    const firstVersion = createMockProduct({ id: 1, name: 'First', inStock: 2 });
    const refreshedVersion = createMockProduct({ id: 1, name: 'Updated', inStock: 2 });

    expect(service.addToCart(firstVersion)).toBe(true);
    expect(service.addToCart(refreshedVersion)).toBe(true);
    expect(service.addToCart(refreshedVersion)).toBe(false);
    expect(service.cartLinesSignal()[0]).toEqual({
      product: refreshedVersion,
      quantity: 2,
      lineTotal: refreshedVersion.price * 2,
    });
    expect(service.numberOfItemsSignal()).toBe(2);
  });

  it('does not add an out-of-stock product', () => {
    const service = createService();

    expect(service.addToCart(createMockProduct({ inStock: 0 }))).toBe(false);
    expect(service.cartItemsSignal()).toEqual([]);
  });

  it('does not mutate state when adding cannot be persisted', () => {
    const service = createService();
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage full');
    });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(service.addToCart(mockProducts[0])).toBe(false);
    expect(service.cartItemsSignal()).toEqual([]);
  });

  it('removes an existing product and ignores a missing product', () => {
    const service = createService();
    service.addToCart(mockProducts[0]);
    service.addToCart(mockProducts[1]);

    expect(service.removeFromCart(mockProducts[0])).toBe(true);
    expect(service.removeFromCart(mockProducts[0])).toBe(false);
    expect(service.cartItemsSignal()).toEqual([mockProducts[1]]);
  });

  it('keeps a product when removal cannot be persisted', () => {
    const service = createService();
    service.addToCart(mockProducts[0]);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(service.removeFromCart(mockProducts[0])).toBe(false);
    expect(service.inCart(mockProducts[0].id)).toBe(true);
  });

  it('validates, caps, and persists quantities', () => {
    const service = createService();
    service.addToCart(createMockProduct({ inStock: 4 }));
    service.addToCart(createMockProduct({ id: 2, inStock: 8 }));

    expect(service.setQuantity(999, 2)).toBe(false);
    expect(service.setQuantity(1, 1.5)).toBe(false);
    expect(service.setQuantity(1, Number.NaN)).toBe(false);
    expect(service.setQuantity(1, 99)).toBe(true);
    expect(service.getQuantities()).toEqual([4, 1]);
    expect(service.setQuantity(1, 4)).toBe(true);
  });

  it('keeps the current quantity when an update cannot be persisted', () => {
    const service = createService();
    service.addToCart(mockProducts[0]);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(service.setQuantity(mockProducts[0].id, 2)).toBe(false);
    expect(service.getQuantities()).toEqual([1]);
  });

  it('exposes compatible observable projections', () => {
    const service = createService();
    const product = createMockProduct({ price: 25, inStock: 4 });
    service.addToCart(product);
    service.setQuantity(product.id, 3);

    const items: unknown[] = [];
    const lines: unknown[] = [];
    const totals: number[] = [];
    const counts: number[] = [];
    service.cartItems.subscribe((value) => items.push(value));
    service.getCartLines().subscribe((value) => lines.push(value));
    service.getTotalPrice().subscribe((value) => totals.push(value));
    service.getNumberOfItems().subscribe((value) => counts.push(value));

    expect(items.at(-1)).toEqual([product]);
    expect(lines.at(-1)).toEqual([{ product, quantity: 3, lineTotal: 75 }]);
    expect(totals.at(-1)).toBe(75);
    expect(counts.at(-1)).toBe(3);
  });

  it('synchronizes versioned cart changes from another tab', () => {
    const service = createService();
    const product = createMockProduct({ id: 44 });

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'unrelated',
      newValue: 'ignored',
    }));
    expect(service.cartItemsSignal()).toEqual([]);

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cart',
      newValue: storedCart([{ product, quantity: 2 }]),
    }));
    expect(service.cartLinesSignal()[0].quantity).toBe(2);

    window.dispatchEvent(new StorageEvent('storage', { key: 'cart', newValue: null }));
    expect(service.cartItemsSignal()).toEqual([]);
  });

  it('removes its storage listener when the injector is destroyed', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    createService();

    TestBed.resetTestingModule();

    expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));
  });
});
