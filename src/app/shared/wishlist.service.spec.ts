import { TestBed } from '@angular/core/testing';
import { WishlistService } from './wishlist.service';
import { mockProducts, createMockProduct } from '../testing/mock-data';

describe('WishlistService', () => {
    let service: WishlistService;
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
            providers: [WishlistService]
        });
    });

    afterEach(() => {
        localStorageSpy.clear();
    });

    describe('Initialization', () => {
        it('should be created', () => {
            service = TestBed.inject(WishlistService);
            expect(service).toBeTruthy();
        });

        it('should initialize with empty wishlist when localStorage is empty', () => {
            service = TestBed.inject(WishlistService);

            expect(service.wishListItemsSignal()).toEqual([]);
        });

        it('should load wishlist items from localStorage on initialization', () => {
            const savedProducts = [mockProducts[0], mockProducts[1]];
            localStorageSpy.getItem.mockReturnValue(JSON.stringify(savedProducts));

            service = TestBed.inject(WishlistService);

            expect(service.wishListItemsSignal()).toEqual(savedProducts);
            expect(localStorageSpy.getItem).toHaveBeenCalledWith('wishlist');
        });

        it('should handle corrupted localStorage data gracefully', () => {
            localStorageSpy.getItem.mockReturnValue('invalid json{');
            jest.spyOn(console, 'error').mockReturnValue(undefined);

            service = TestBed.inject(WishlistService);

            expect(service.wishListItemsSignal()).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle localStorage errors gracefully', () => {
            localStorageSpy.getItem.mockImplementation(() => {
                throw new Error('Storage error');
            });
            jest.spyOn(console, 'error').mockReturnValue(undefined);

            service = TestBed.inject(WishlistService);

            expect(service.wishListItemsSignal()).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('wishListItemsSignal', () => {
        beforeEach(() => {
            service = TestBed.inject(WishlistService);
        });

        it('should return wishlist items and update when wishlist changes', () => {
            const product = mockProducts[0];
            expect(service.wishListItemsSignal()).toEqual([]);

            service.addWishListItem(product);
            expect(service.wishListItemsSignal()).toEqual([product]);
        });
    });

    describe('inWishlist', () => {
        beforeEach(() => {
            service = TestBed.inject(WishlistService);
        });

        it('should return false for empty wishlist', () => {
            expect(service.inWishlist(1)).toBe(false);
        });

        it('should return true if product is in wishlist', () => {
            service.addWishListItem(mockProducts[0]);

            expect(service.inWishlist(mockProducts[0].id)).toBe(true);
        });

        it('should return false if product is not in wishlist', () => {
            service.addWishListItem(mockProducts[0]);

            expect(service.inWishlist(mockProducts[1].id)).toBe(false);
        });

        it('should return false after product is removed from wishlist', () => {
            service.addWishListItem(mockProducts[0]);
            service.removeWishListItem(mockProducts[0]);

            expect(service.inWishlist(mockProducts[0].id)).toBe(false);
        });
    });

    describe('addWishListItem', () => {
        beforeEach(() => {
            service = TestBed.inject(WishlistService);
        });

        it('should add a product to wishlist', () => {
            const product = mockProducts[0];

            service.addWishListItem(product);

            const items = service.wishListItemsSignal();
            expect(items.length).toBe(1);
            expect(items[0]).toEqual(product);
        });

        it('should add multiple products to wishlist', () => {
            service.addWishListItem(mockProducts[0]);
            service.addWishListItem(mockProducts[1]);

            const items = service.wishListItemsSignal();
            expect(items.length).toBe(2);
            expect(items).toContainEqual(mockProducts[0]);
            expect(items).toContainEqual(mockProducts[1]);
        });

        it('should save wishlist to localStorage when adding item', () => {
            const product = mockProducts[0];

            service.addWishListItem(product);

            expect(localStorageSpy.setItem).toHaveBeenCalledWith('wishlist', JSON.stringify([product]));
        });

        it('should handle localStorage save errors gracefully', () => {
            localStorageSpy.setItem.mockImplementation(() => {
                throw new Error('Storage full');
            });
            jest.spyOn(console, 'error').mockReturnValue(undefined);
            const product = mockProducts[0];

            service.addWishListItem(product);

            expect(console.error).toHaveBeenCalled();
            expect(service.wishListItemsSignal().length).toBe(0);
        });

        it('should allow adding the same product multiple times', () => {
            const product = mockProducts[0];

            service.addWishListItem(product);
            service.addWishListItem(product);

            const items = service.wishListItemsSignal();
            expect(items.length).toBe(2);
            expect(items.filter(p => p.id === product.id).length).toBe(2);
        });

        it('should add different products with different categories', () => {
            const product1 = createMockProduct({ id: 1, categoryId: 1 });
            const product2 = createMockProduct({ id: 2, categoryId: 2 });

            service.addWishListItem(product1);
            service.addWishListItem(product2);

            const items = service.wishListItemsSignal();
            expect(items.length).toBe(2);
            expect(items[0].categoryId).toBe(1);
            expect(items[1].categoryId).toBe(2);
        });
    });

    describe('removeWishListItem', () => {
        beforeEach(() => {
            service = TestBed.inject(WishlistService);
        });

        it('should remove a product from wishlist', () => {
            const product = mockProducts[0];
            service.addWishListItem(product);

            service.removeWishListItem(product);

            expect(service.wishListItemsSignal().length).toBe(0);
        });

        it('should remove only the specified product', () => {
            service.addWishListItem(mockProducts[0]);
            service.addWishListItem(mockProducts[1]);

            service.removeWishListItem(mockProducts[0]);

            const items = service.wishListItemsSignal();
            expect(items.length).toBe(1);
            expect(items[0]).toEqual(mockProducts[1]);
        });

        it('should save updated wishlist to localStorage when removing item', () => {
            service.addWishListItem(mockProducts[0]);
            service.addWishListItem(mockProducts[1]);

            service.removeWishListItem(mockProducts[0]);

            expect(localStorageSpy.setItem).toHaveBeenCalledWith('wishlist', JSON.stringify([mockProducts[1]]));
        });

        it('should handle localStorage save errors when removing', () => {
            service.addWishListItem(mockProducts[0]);
            localStorageSpy.setItem.mockImplementation(() => {
                throw new Error('Storage error');
            });
            jest.spyOn(console, 'error').mockReturnValue(undefined);

            service.removeWishListItem(mockProducts[0]);

            expect(console.error).toHaveBeenCalled();
            expect(service.wishListItemsSignal().length).toBe(1);
        });

        it('should do nothing when removing non-existent product', () => {
            service.addWishListItem(mockProducts[0]);

            service.removeWishListItem(mockProducts[1]);

            const items = service.wishListItemsSignal();
            expect(items.length).toBe(1);
            expect(items[0]).toEqual(mockProducts[0]);
        });

        it('should remove all instances when product appears multiple times', () => {
            const product = mockProducts[0];
            service.addWishListItem(product);
            service.addWishListItem(product);
            service.addWishListItem(product);

            service.removeWishListItem(product);

            expect(service.wishListItemsSignal().length).toBe(0);
            expect(service.inWishlist(product.id)).toBe(false);
        });
    });

    describe('Integration Tests', () => {
        beforeEach(() => {
            service = TestBed.inject(WishlistService);
        });

        it('should handle complex wishlist operations', () => {
            service.addWishListItem(mockProducts[0]);
            service.addWishListItem(mockProducts[1]);
            service.addWishListItem(mockProducts[2]);

            expect(service.inWishlist(mockProducts[0].id)).toBe(true);
            expect(service.inWishlist(mockProducts[1].id)).toBe(true);
            expect(service.inWishlist(mockProducts[2].id)).toBe(true);

            service.removeWishListItem(mockProducts[1]);

            expect(service.wishListItemsSignal().length).toBe(2);
            expect(service.inWishlist(mockProducts[1].id)).toBe(false);
            expect(service.inWishlist(mockProducts[0].id)).toBe(true);
            expect(service.inWishlist(mockProducts[2].id)).toBe(true);
        });

        it('should persist and restore wishlist state', () => {
            service.addWishListItem(mockProducts[0]);
            service.addWishListItem(mockProducts[1]);
            service.addWishListItem(mockProducts[2]);

            const newService = new WishlistService();

            const items = newService.wishListItemsSignal();
            expect(items.length).toBe(3);
            expect(items).toContainEqual(mockProducts[0]);
            expect(items).toContainEqual(mockProducts[1]);
            expect(items).toContainEqual(mockProducts[2]);
        });

        it('should handle adding and removing same product sequentially', () => {
            const product = mockProducts[0];

            service.addWishListItem(product);
            expect(service.inWishlist(product.id)).toBe(true);

            service.removeWishListItem(product);
            expect(service.inWishlist(product.id)).toBe(false);

            service.addWishListItem(product);
            expect(service.inWishlist(product.id)).toBe(true);

            const items = service.wishListItemsSignal();
            expect(items.length).toBe(1);
            expect(items[0]).toEqual(product);
        });
    });
});
