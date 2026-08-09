import { TestBed } from '@angular/core/testing';
import { createMockProduct, mockProducts } from '../testing/mock-data';
import { WishlistService } from './wishlist.service';

describe('WishlistService', () => {
  let storage: Record<string, string>;
  let localStorageMock: {
    getItem: jest.Mock<string | null, [string]>;
    setItem: jest.Mock<void, [string, string]>;
  };

  const createService = (): WishlistService => TestBed.inject(WishlistService);

  beforeEach(() => {
    storage = {};
    localStorageMock = {
      getItem: jest.fn((key: string) => storage[key] ?? null),
      setItem: jest.fn((key: string, value: string) => {
        storage[key] = value;
      }),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
    });
    TestBed.configureTestingModule({ providers: [WishlistService] });
  });

  it('starts empty when no saved wishlist exists', () => {
    const service = createService();

    expect(service.wishListItemsSignal()).toEqual([]);
    expect(service.inWishlist(1)).toBe(false);
  });

  it('restores valid items and removes stored duplicates', () => {
    const original = createMockProduct({ id: 1, name: 'Original' });
    const refreshed = createMockProduct({ id: 1, name: 'Refreshed' });
    storage['wishlist'] = JSON.stringify([original, refreshed, mockProducts[1]]);

    const service = createService();

    expect(service.wishListItemsSignal()).toEqual([refreshed, mockProducts[1]]);
  });

  it('ignores malformed or invalid saved data', () => {
    storage['wishlist'] = '{broken-json';
    expect(createService().wishListItemsSignal()).toEqual([]);
  });

  it('recovers when storage access throws', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(createService().wishListItemsSignal()).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('adds distinct products and refuses duplicates', () => {
    const service = createService();

    expect(service.addWishListItem(mockProducts[0])).toBe(true);
    expect(service.addWishListItem(mockProducts[0])).toBe(false);
    expect(service.addWishListItem(mockProducts[1])).toBe(true);
    expect(service.wishListItemsSignal()).toEqual([mockProducts[0], mockProducts[1]]);
    expect(service.inWishlist(mockProducts[0].id)).toBe(true);
  });

  it('keeps state unchanged when an add cannot be saved', () => {
    const service = createService();
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage full');
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(service.addWishListItem(mockProducts[0])).toBe(false);
    expect(service.wishListItemsSignal()).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('removes an existing product and ignores a missing product', () => {
    const service = createService();
    service.addWishListItem(mockProducts[0]);

    expect(service.removeWishListItem(mockProducts[1])).toBe(false);
    expect(service.removeWishListItem(mockProducts[0])).toBe(true);
    expect(service.wishListItemsSignal()).toEqual([]);
  });

  it('keeps state unchanged when a removal cannot be saved', () => {
    const service = createService();
    service.addWishListItem(mockProducts[0]);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(service.removeWishListItem(mockProducts[0])).toBe(false);
    expect(service.wishListItemsSignal()).toEqual([mockProducts[0]]);
  });

  it('synchronizes changes from another tab', () => {
    const service = createService();
    const product = createMockProduct({ id: 44 });

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'unrelated',
      newValue: JSON.stringify([product]),
    }));
    expect(service.wishListItemsSignal()).toEqual([]);

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'wishlist',
      newValue: JSON.stringify([product, product]),
    }));
    expect(service.wishListItemsSignal()).toEqual([product]);
  });

  it('removes its storage listener when the injector is destroyed', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    createService();

    TestBed.resetTestingModule();

    expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));
  });
});
