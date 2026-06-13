import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { mockProducts, createMockProduct } from '../testing/mock-data';
import { Product } from '../features/products/Product';

describe('CartService', () => {
  let service: CartService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    // Create a mock localStorage
    const store: { [key: string]: string } = {};
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem', 'clear']);
    localStorageSpy.getItem.and.callFake((key: string) => store[key] || null);
    localStorageSpy.setItem.and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    localStorageSpy.removeItem.and.callFake((key: string) => {
      delete store[key];
    });
    localStorageSpy.clear.and.callFake(() => {
      Object.keys(store).forEach(key => delete store[key]);
    });

    // Replace global localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true
    });

    TestBed.configureTestingModule({
      providers: [CartService]
    });
  });

  afterEach(() => {
    localStorageSpy.clear();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      service = TestBed.inject(CartService);
      expect(service).toBeTruthy();
    });

    it('should initialize with empty cart when localStorage is empty', (done) => {
      service = TestBed.inject(CartService);

      service.getCartItems().subscribe(items => {
        expect(items).toEqual([]);
        done();
      });
    });

    it('should load cart items from localStorage on initialization', (done) => {
      const savedProducts = [mockProducts[0], mockProducts[1]];
      localStorageSpy.getItem.and.returnValue(JSON.stringify(savedProducts));

      service = TestBed.inject(CartService);

      service.getCartItems().subscribe(items => {
        expect(items).toEqual(savedProducts);
        expect(localStorageSpy.getItem).toHaveBeenCalledWith('cart');
        done();
      });
    });

    it('should handle corrupted localStorage data gracefully', (done) => {
      localStorageSpy.getItem.and.returnValue('invalid json{');
      spyOn(console, 'error');

      service = TestBed.inject(CartService);

      service.getCartItems().subscribe(items => {
        expect(items).toEqual([]);
        expect(console.error).toHaveBeenCalled();
        done();
      });
    });

    it('should handle localStorage errors gracefully', (done) => {
      localStorageSpy.getItem.and.throwError('Storage error');
      spyOn(console, 'error');

      service = TestBed.inject(CartService);

      service.getCartItems().subscribe(items => {
        expect(items).toEqual([]);
        expect(console.error).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('addToCart', () => {
    beforeEach(() => {
      service = TestBed.inject(CartService);
    });

    it('should add a product to cart', (done) => {
      const product = mockProducts[0];

      service.addToCart(product);

      service.getCartItems().subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0]).toEqual(product);
        done();
      });
    });

    it('should add multiple products to cart', (done) => {
      service.addToCart(mockProducts[0]);
      service.addToCart(mockProducts[1]);

      service.getCartItems().subscribe(items => {
        expect(items.length).toBe(2);
        expect(items).toContain(mockProducts[0]);
        expect(items).toContain(mockProducts[1]);
        done();
      });
    });

    it('should save cart to localStorage when adding item', () => {
      const product = mockProducts[0];

      service.addToCart(product);

      expect(localStorageSpy.setItem).toHaveBeenCalledWith('cart', JSON.stringify([product]));
    });

    it('should handle localStorage save errors gracefully', (done) => {
      localStorageSpy.setItem.and.throwError('Storage full');
      spyOn(console, 'error');
      const product = mockProducts[0];

      service.addToCart(product);

      expect(console.error).toHaveBeenCalled();
      service.getCartItems().subscribe(items => {
        // Item should not be added if save fails
        expect(items.length).toBe(0);
        done();
      });
    });

    it('should allow adding the same product multiple times', (done) => {
      const product = mockProducts[0];

      service.addToCart(product);
      service.addToCart(product);

      service.getCartItems().subscribe(items => {
        expect(items.length).toBe(2);
        expect(items.filter(p => p.id === product.id).length).toBe(2);
        done();
      });
    });
  });

  describe('removeFromCart', () => {
    beforeEach(() => {
      service = TestBed.inject(CartService);
    });

    it('should remove a product from cart', (done) => {
      const product = mockProducts[0];
      service.addToCart(product);

      service.removeFromCart(product);

      service.getCartItems().subscribe(items => {
        expect(items.length).toBe(0);
        done();
      });
    });

    it('should remove only the specified product', (done) => {
      service.addToCart(mockProducts[0]);
      service.addToCart(mockProducts[1]);

      service.removeFromCart(mockProducts[0]);

      service.getCartItems().subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0]).toEqual(mockProducts[1]);
        done();
      });
    });

    it('should save updated cart to localStorage when removing item', () => {
      service.addToCart(mockProducts[0]);
      service.addToCart(mockProducts[1]);

      service.removeFromCart(mockProducts[0]);

      expect(localStorageSpy.setItem).toHaveBeenCalledWith('cart', JSON.stringify([mockProducts[1]]));
    });

    it('should handle localStorage save errors when removing', (done) => {
      service.addToCart(mockProducts[0]);
      localStorageSpy.setItem.and.throwError('Storage error');
      spyOn(console, 'error');

      service.removeFromCart(mockProducts[0]);

      expect(console.error).toHaveBeenCalled();
      service.getCartItems().subscribe(items => {
        // Item should not be removed if save fails
        expect(items.length).toBe(1);
        done();
      });
    });

    it('should do nothing when removing non-existent product', (done) => {
      service.addToCart(mockProducts[0]);

      service.removeFromCart(mockProducts[1]);

      service.getCartItems().subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0]).toEqual(mockProducts[0]);
        done();
      });
    });

    // Edge case the happy-path tests miss: removeFromCart filters by id, so a
    // single remove drops EVERY copy of a duplicated product rather than
    // decrementing a quantity. This test documents that behaviour (and flags it
    // as a latent bug: the cart models quantity by repeating items, but removal
    // does not match that model).
    it('removes ALL copies of a duplicated product in a single call', (done) => {
      service.addToCart(mockProducts[0]);
      service.addToCart(mockProducts[0]);

      service.removeFromCart(mockProducts[0]);

      service.getCartItems().subscribe(items => {
        expect(items.length).toBe(0); // both copies gone, not one
        expect(service.inCart(mockProducts[0].id)).toBe(false);
        done();
      });
    });
  });

  describe('getCartItems', () => {
    beforeEach(() => {
      service = TestBed.inject(CartService);
    });

    it('should return an observable of cart items', (done) => {
      service.getCartItems().subscribe(items => {
        expect(items).toEqual([]);
        done();
      });
    });

    it('should emit updated cart items when cart changes', (done) => {
      const product = mockProducts[0];
      let emissionCount = 0;

      service.getCartItems().subscribe(items => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(items).toEqual([]);
        } else if (emissionCount === 2) {
          expect(items).toEqual([product]);
          done();
        }
      });

      service.addToCart(product);
    });
  });

  describe('getTotalPrice', () => {
    beforeEach(() => {
      service = TestBed.inject(CartService);
    });

    it('should return 0 for empty cart', (done) => {
      service.getTotalPrice().subscribe(total => {
        expect(total).toBe(0);
        done();
      });
    });

    it('should calculate total price for single product', (done) => {
      const product = createMockProduct({ price: 99.99 });
      service.addToCart(product);

      service.getTotalPrice().subscribe(total => {
        expect(total).toBe(99.99);
        done();
      });
    });

    it('should calculate total price for multiple products', (done) => {
      const product1 = createMockProduct({ id: 1, price: 50.00 });
      const product2 = createMockProduct({ id: 2, price: 30.00 });
      const product3 = createMockProduct({ id: 3, price: 20.00 });

      service.addToCart(product1);
      service.addToCart(product2);
      service.addToCart(product3);

      service.getTotalPrice().subscribe(total => {
        expect(total).toBe(100.00);
        done();
      });
    });

    it('should count duplicate products in total price', (done) => {
      const product = createMockProduct({ price: 25.00 });

      service.addToCart(product);
      service.addToCart(product);
      service.addToCart(product);

      service.getTotalPrice().subscribe(total => {
        expect(total).toBe(75.00);
        done();
      });
    });

    it('should update total price when items are removed', (done) => {
      const product1 = createMockProduct({ id: 1, price: 50.00 });
      const product2 = createMockProduct({ id: 2, price: 30.00 });

      service.addToCart(product1);
      service.addToCart(product2);
      service.removeFromCart(product1);

      service.getTotalPrice().subscribe(total => {
        expect(total).toBe(30.00);
        done();
      });
    });

    it('should multiply line totals by persisted quantities', (done) => {
      const product = createMockProduct({ price: 100.00 });
      service.addToCart(product);
      service.setQuantityAtIndex(0, 3);

      service.getTotalPrice().subscribe(total => {
        expect(total).toBe(300.00);
        done();
      });
    });
  });

  describe('getCartLines', () => {
    beforeEach(() => {
      service = TestBed.inject(CartService);
    });

    it('should expose quantity and line totals for each cart row', (done) => {
      const product = createMockProduct({ price: 50.00 });
      service.addToCart(product);
      service.setQuantityAtIndex(0, 2);

      service.getCartLines().subscribe(lines => {
        expect(lines.length).toBe(1);
        expect(lines[0].quantity).toBe(2);
        expect(lines[0].lineTotal).toBe(100.00);
        done();
      });
    });
  });

  describe('setQuantityAtIndex', () => {
    beforeEach(() => {
      service = TestBed.inject(CartService);
    });

    it('should persist quantities to localStorage', () => {
      service.addToCart(mockProducts[0]);
      service.setQuantityAtIndex(0, 4);

      expect(localStorageSpy.setItem).toHaveBeenCalledWith('cartQuantities', JSON.stringify([4]));
      expect(service.getQuantities()).toEqual([4]);
    });

    it('should clamp quantities to at least 1', () => {
      service.addToCart(mockProducts[0]);
      service.setQuantityAtIndex(0, 0);

      expect(service.getQuantities()).toEqual([1]);
    });
  });

  describe('getNumberOfItems', () => {
    beforeEach(() => {
      service = TestBed.inject(CartService);
    });

    it('should return 0 for empty cart', (done) => {
      service.getNumberOfItems().subscribe(count => {
        expect(count).toBe(0);
        done();
      });
    });

    it('should return correct count for single item', (done) => {
      service.addToCart(mockProducts[0]);

      service.getNumberOfItems().subscribe(count => {
        expect(count).toBe(1);
        done();
      });
    });

    it('should return correct count for multiple items', (done) => {
      service.addToCart(mockProducts[0]);
      service.addToCart(mockProducts[1]);
      service.addToCart(mockProducts[2]);

      service.getNumberOfItems().subscribe(count => {
        expect(count).toBe(3);
        done();
      });
    });

    it('should count duplicate products separately', (done) => {
      service.addToCart(mockProducts[0]);
      service.addToCart(mockProducts[0]);

      service.getNumberOfItems().subscribe(count => {
        expect(count).toBe(2);
        done();
      });
    });

    it('should update count when items are removed', (done) => {
      service.addToCart(mockProducts[0]);
      service.addToCart(mockProducts[1]);
      service.removeFromCart(mockProducts[0]);

      service.getNumberOfItems().subscribe(count => {
        expect(count).toBe(1);
        done();
      });
    });
  });

  describe('inCart', () => {
    beforeEach(() => {
      service = TestBed.inject(CartService);
    });

    it('should return false for empty cart', () => {
      expect(service.inCart(1)).toBe(false);
    });

    it('should return true if product is in cart', () => {
      service.addToCart(mockProducts[0]);

      expect(service.inCart(mockProducts[0].id)).toBe(true);
    });

    it('should return false if product is not in cart', () => {
      service.addToCart(mockProducts[0]);

      expect(service.inCart(mockProducts[1].id)).toBe(false);
    });

    it('should return true if product is in cart multiple times', () => {
      service.addToCart(mockProducts[0]);
      service.addToCart(mockProducts[0]);

      expect(service.inCart(mockProducts[0].id)).toBe(true);
    });

    it('should return false after product is removed from cart', () => {
      service.addToCart(mockProducts[0]);
      service.removeFromCart(mockProducts[0]);

      expect(service.inCart(mockProducts[0].id)).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      service = TestBed.inject(CartService);
    });

    it('should handle complex cart operations', (done) => {
      // Add multiple items
      service.addToCart(mockProducts[0]);
      service.addToCart(mockProducts[1]);
      service.addToCart(mockProducts[0]); // Duplicate

      // Check state
      expect(service.inCart(mockProducts[0].id)).toBe(true);
      expect(service.inCart(mockProducts[1].id)).toBe(true);

      // Remove one item
      service.removeFromCart(mockProducts[1]);

      service.getCartItems().subscribe(items => {
        expect(items.length).toBe(2);
        expect(service.inCart(mockProducts[1].id)).toBe(false);
        done();
      });
    });

    it('should persist and restore cart state', (done) => {
      // Add items
      service.addToCart(mockProducts[0]);
      service.addToCart(mockProducts[1]);

      // Simulate page reload by creating new service instance
      const newService = new CartService();

      newService.getCartItems().subscribe(items => {
        expect(items.length).toBe(2);
        expect(items).toContain(mockProducts[0]);
        expect(items).toContain(mockProducts[1]);
        done();
      });
    });
  });
});
