import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { mockProducts, createMockProduct } from '../testing/mock-data';

describe('CartService', () => {
    let service: CartService;
    let localStorageSpy: any;

    beforeEach(() => {
        // Create a mock localStorage
        const store: {
            [key: string]: string;
        } = {};
        localStorageSpy = {
            getItem: jest.fn().mockName("localStorage.getItem"),
            setItem: jest.fn().mockName("localStorage.setItem"),
            removeItem: jest.fn().mockName("localStorage.removeItem"),
            clear: jest.fn().mockName("localStorage.clear")
        };
        localStorageSpy.getItem.mockImplementation((key: string) => store[key] || null);
        localStorageSpy.setItem.mockImplementation((key: string, value: string) => {
            store[key] = value;
        });
        localStorageSpy.removeItem.mockImplementation((key: string) => {
            delete store[key];
        });
        localStorageSpy.clear.mockImplementation(() => {
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

        it('should initialize with empty cart when localStorage is empty', () => {
            service = TestBed.inject(CartService);

            expect(service.cartItemsSignal()).toEqual([]);
        });

        it('should load cart items from localStorage on initialization', () => {
            const savedProducts = [mockProducts[0], mockProducts[1]];
            localStorageSpy.getItem.mockReturnValue(JSON.stringify(savedProducts));

            service = TestBed.inject(CartService);

            expect(service.cartItemsSignal()).toEqual(savedProducts);
            expect(localStorageSpy.getItem).toHaveBeenCalledWith('cart');
        });

        it('loads valid quantities, normalizes invalid values, and trims extras', () => {
            const savedProducts = [mockProducts[0], mockProducts[1]];
            localStorageSpy.getItem.mockImplementation((key: string) => {
                if (key === 'cart') return JSON.stringify(savedProducts);
                if (key === 'cartQuantities') return JSON.stringify([3, 0, 9]);
                return null;
            });

            service = TestBed.inject(CartService);

            expect(service.getQuantities()).toEqual([3, 1]);
        });

        it('fills missing quantities for a restored cart', () => {
            const savedProducts = [mockProducts[0], mockProducts[1]];
            localStorageSpy.getItem.mockImplementation((key: string) => {
                if (key === 'cart') return JSON.stringify(savedProducts);
                if (key === 'cartQuantities') return JSON.stringify([2]);
                return null;
            });

            service = TestBed.inject(CartService);

            expect(service.getQuantities()).toEqual([2, 1]);
        });

        it.each([null, JSON.stringify({ quantity: 2 })])(
            'uses quantity one when stored quantities are absent or not an array',
            (storedQuantities) => {
                localStorageSpy.getItem.mockImplementation((key: string) => {
                    if (key === 'cart') return JSON.stringify([mockProducts[0]]);
                    if (key === 'cartQuantities') return storedQuantities;
                    return null;
                });

                service = TestBed.inject(CartService);

                expect(service.getQuantities()).toEqual([1]);
            },
        );

        it('recovers from malformed stored quantities', () => {
            jest.spyOn(console, 'error').mockReturnValue(undefined);
            localStorageSpy.getItem.mockImplementation((key: string) => {
                if (key === 'cart') return JSON.stringify([mockProducts[0]]);
                if (key === 'cartQuantities') return '{broken';
                return null;
            });

            service = TestBed.inject(CartService);

            expect(service.getQuantities()).toEqual([1]);
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle corrupted localStorage data gracefully', () => {
            localStorageSpy.getItem.mockReturnValue('invalid json{');
            jest.spyOn(console, 'error').mockReturnValue(undefined);

            service = TestBed.inject(CartService);

            expect(service.cartItemsSignal()).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle localStorage errors gracefully', () => {
            localStorageSpy.getItem.mockImplementation(() => {
                throw new Error('Storage error');
            });
            jest.spyOn(console, 'error').mockReturnValue(undefined);

            service = TestBed.inject(CartService);

            expect(service.cartItemsSignal()).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('addToCart', () => {
        beforeEach(() => {
            service = TestBed.inject(CartService);
        });

        it('should add a product to cart', () => {
            const product = mockProducts[0];

            service.addToCart(product);

            const items = service.cartItemsSignal();
            expect(items.length).toBe(1);
            expect(items[0]).toEqual(product);
        });

        it('should add multiple products to cart', () => {
            service.addToCart(mockProducts[0]);
            service.addToCart(mockProducts[1]);

            const items = service.cartItemsSignal();
            expect(items.length).toBe(2);
            expect(items).toContainEqual(mockProducts[0]);
            expect(items).toContainEqual(mockProducts[1]);
        });

        it('should save cart to localStorage when adding item', () => {
            const product = mockProducts[0];

            service.addToCart(product);

            expect(localStorageSpy.setItem).toHaveBeenCalledWith('cart', JSON.stringify([product]));
        });

        it('should handle localStorage save errors gracefully', () => {
            localStorageSpy.setItem.mockImplementation(() => {
                throw new Error('Storage full');
            });
            jest.spyOn(console, 'error').mockReturnValue(undefined);
            const product = mockProducts[0];

            service.addToCart(product);

            expect(console.error).toHaveBeenCalled();
            expect(service.cartItemsSignal().length).toBe(0);
        });

        it('should increment quantity when adding the same product again', () => {
            const product = mockProducts[0];

            service.addToCart(product);
            service.addToCart(product);

            const items = service.cartItemsSignal();
            expect(items.length).toBe(1);
            expect(items[0]).toEqual(product);
        });

        it('should increment persisted quantity for duplicate adds', () => {
            const product = createMockProduct({ price: 25.00 });

            service.addToCart(product);
            service.addToCart(product);
            service.addToCart(product);

            const lines = service.cartLinesSignal();
            expect(lines.length).toBe(1);
            expect(lines[0].quantity).toBe(3);
            expect(lines[0].lineTotal).toBe(75.00);
        });
    });

    describe('removeFromCart', () => {
        beforeEach(() => {
            service = TestBed.inject(CartService);
        });

        it('should remove a product from cart', () => {
            const product = mockProducts[0];
            service.addToCart(product);

            service.removeFromCart(product);

            expect(service.cartItemsSignal().length).toBe(0);
        });

        it('should remove only the specified product', () => {
            service.addToCart(mockProducts[0]);
            service.addToCart(mockProducts[1]);

            service.removeFromCart(mockProducts[0]);

            const items = service.cartItemsSignal();
            expect(items.length).toBe(1);
            expect(items[0]).toEqual(mockProducts[1]);
        });

        it('should save updated cart to localStorage when removing item', () => {
            service.addToCart(mockProducts[0]);
            service.addToCart(mockProducts[1]);

            service.removeFromCart(mockProducts[0]);

            expect(localStorageSpy.setItem).toHaveBeenCalledWith('cart', JSON.stringify([mockProducts[1]]));
        });

        it('should handle localStorage save errors when removing', () => {
            service.addToCart(mockProducts[0]);
            localStorageSpy.setItem.mockImplementation(() => {
                throw new Error('Storage error');
            });
            jest.spyOn(console, 'error').mockReturnValue(undefined);

            service.removeFromCart(mockProducts[0]);

            expect(console.error).toHaveBeenCalled();
            expect(service.cartItemsSignal().length).toBe(1);
        });

        it('should do nothing when removing non-existent product', () => {
            service.addToCart(mockProducts[0]);

            service.removeFromCart(mockProducts[1]);

            const items = service.cartItemsSignal();
            expect(items.length).toBe(1);
            expect(items[0]).toEqual(mockProducts[0]);
        });

        it('removes the product row when removeFromCart is called once', () => {
            service.addToCart(mockProducts[0]);
            service.addToCart(mockProducts[0]);

            service.removeFromCart(mockProducts[0]);

            expect(service.cartItemsSignal().length).toBe(0);
            expect(service.inCart(mockProducts[0].id)).toBe(false);
        });
    });

    describe('clearCart', () => {
        beforeEach(() => {
            service = TestBed.inject(CartService);
        });

        it('clears all cart items and quantities and persists empty state', () => {
            service.addToCart(mockProducts[0]);
            service.addToCart(mockProducts[1]);

            service.clearCart();

            expect(service.cartItemsSignal()).toEqual([]);
            expect(service.getQuantities()).toEqual([]);
            expect(service.totalPriceSignal()).toBe(0);
            expect(service.numberOfItemsSignal()).toBe(0);
            expect(localStorageSpy.setItem).toHaveBeenCalledWith('cart', JSON.stringify([]));
            expect(localStorageSpy.setItem).toHaveBeenCalledWith('cartQuantities', JSON.stringify([]));
        });
    });

    describe('cartItemsSignal', () => {
        beforeEach(() => {
            service = TestBed.inject(CartService);
        });

        it('should return cart items and update when cart changes', () => {
            const product = mockProducts[0];
            expect(service.cartItemsSignal()).toEqual([]);

            service.addToCart(product);
            expect(service.cartItemsSignal()).toEqual([product]);
        });
    });

    describe('totalPriceSignal', () => {
        beforeEach(() => {
            service = TestBed.inject(CartService);
        });

        it('should return 0 for empty cart', () => {
            expect(service.totalPriceSignal()).toBe(0);
        });

        it('should calculate total price for single product', () => {
            const product = createMockProduct({ price: 99.99 });
            service.addToCart(product);

            expect(service.totalPriceSignal()).toBe(99.99);
        });

        it('should calculate total price for multiple products', () => {
            const product1 = createMockProduct({ id: 1, price: 50.00 });
            const product2 = createMockProduct({ id: 2, price: 30.00 });
            const product3 = createMockProduct({ id: 3, price: 20.00 });

            service.addToCart(product1);
            service.addToCart(product2);
            service.addToCart(product3);

            expect(service.totalPriceSignal()).toBe(100.00);
        });

        it('should count duplicate products in total price', () => {
            const product = createMockProduct({ price: 25.00 });

            service.addToCart(product);
            service.addToCart(product);
            service.addToCart(product);

            expect(service.totalPriceSignal()).toBe(75.00);
        });

        it('should update total price when items are removed', () => {
            const product1 = createMockProduct({ id: 1, price: 50.00 });
            const product2 = createMockProduct({ id: 2, price: 30.00 });

            service.addToCart(product1);
            service.addToCart(product2);
            service.removeFromCart(product1);

            expect(service.totalPriceSignal()).toBe(30.00);
        });

        it('should multiply line totals by persisted quantities', () => {
            const product = createMockProduct({ price: 100.00 });
            service.addToCart(product);
            service.setQuantityAtIndex(0, 3);

            expect(service.totalPriceSignal()).toBe(300.00);
        });
    });

    describe('cartLinesSignal', () => {
        beforeEach(() => {
            service = TestBed.inject(CartService);
        });

        it('should expose quantity and line totals for each cart row', () => {
            const product = createMockProduct({ price: 50.00 });
            service.addToCart(product);
            service.setQuantityAtIndex(0, 2);

            const lines = service.cartLinesSignal();
            expect(lines.length).toBe(1);
            expect(lines[0].quantity).toBe(2);
            expect(lines[0].lineTotal).toBe(100.00);
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

        it('ignores negative and out-of-range indexes', () => {
            service.addToCart(mockProducts[0]);

            service.setQuantityAtIndex(-1, 5);
            service.setQuantityAtIndex(1, 5);

            expect(service.getQuantities()).toEqual([1]);
        });

        it('keeps the current quantity when persistence fails', () => {
            service.addToCart(mockProducts[0]);
            localStorageSpy.setItem.mockImplementation(() => {
                throw new Error('storage unavailable');
            });
            jest.spyOn(console, 'error').mockReturnValue(undefined);

            service.setQuantityAtIndex(0, 5);

            expect(service.getQuantities()).toEqual([1]);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('getProductIndex', () => {
        it('returns the stored row index or -1', () => {
            service = TestBed.inject(CartService);
            service.addToCart(mockProducts[0]);

            expect(service.getProductIndex(mockProducts[0].id)).toBe(0);
            expect(service.getProductIndex(mockProducts[1].id)).toBe(-1);
        });
    });

    describe('defensive quantity fallbacks', () => {
        beforeEach(() => {
            service = TestBed.inject(CartService);
        });

        it('uses quantity one when a cart line has no quantity entry', () => {
            (service as any).cartItemsState.set([mockProducts[0]]);
            (service as any).quantitiesState.set([]);

            expect(service.cartLinesSignal()[0].quantity).toBe(1);
        });

        it('increments a duplicate from quantity one when persisted quantity is absent', () => {
            (service as any).cartItemsState.set([mockProducts[0]]);
            (service as any).quantitiesState.set([]);

            service.addToCart(mockProducts[0]);

            expect(service.getQuantities()).toEqual([2]);
        });

        it('keeps quantity one when removing another item from incomplete state', () => {
            (service as any).cartItemsState.set([mockProducts[0]]);
            (service as any).quantitiesState.set([]);

            service.removeFromCart(mockProducts[1]);

            expect(service.getQuantities()).toEqual([1]);
        });
    });

    describe('numberOfItemsSignal', () => {
        beforeEach(() => {
            service = TestBed.inject(CartService);
        });

        it('should return 0 for empty cart', () => {
            expect(service.numberOfItemsSignal()).toBe(0);
        });

        it('should return correct count for single item', () => {
            service.addToCart(mockProducts[0]);

            expect(service.numberOfItemsSignal()).toBe(1);
        });

        it('should return correct count for multiple items', () => {
            service.addToCart(mockProducts[0]);
            service.addToCart(mockProducts[1]);
            service.addToCart(mockProducts[2]);

            expect(service.numberOfItemsSignal()).toBe(3);
        });

        it('should keep a single row when the same product is added twice', () => {
            service.addToCart(mockProducts[0]);
            service.addToCart(mockProducts[0]);

            expect(service.numberOfItemsSignal()).toBe(1);
        });

        it('should update count when items are removed', () => {
            service.addToCart(mockProducts[0]);
            service.addToCart(mockProducts[1]);
            service.removeFromCart(mockProducts[0]);

            expect(service.numberOfItemsSignal()).toBe(1);
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

        it('should handle complex cart operations', () => {
            service.addToCart(mockProducts[0]);
            service.addToCart(mockProducts[1]);
            service.addToCart(mockProducts[0]);

            expect(service.inCart(mockProducts[0].id)).toBe(true);
            expect(service.inCart(mockProducts[1].id)).toBe(true);

            service.removeFromCart(mockProducts[1]);

            const items = service.cartItemsSignal();
            expect(items.length).toBe(1);
            expect(items[0].id).toBe(mockProducts[0].id);
            expect(service.inCart(mockProducts[1].id)).toBe(false);
        });

        it('should persist and restore cart state', () => {
            service.addToCart(mockProducts[0]);
            service.addToCart(mockProducts[1]);

            const newService = new CartService();

            const items = newService.cartItemsSignal();
            expect(items.length).toBe(2);
            expect(items).toContainEqual(mockProducts[0]);
            expect(items).toContainEqual(mockProducts[1]);
        });
    });
});
