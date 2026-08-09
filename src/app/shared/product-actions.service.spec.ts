import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { Product } from '../features/products/Product';
import { createMockProduct } from '../testing/mock-data';
import { CartService } from './cart.service';
import { NotificationService } from './notification.service';
import { ProductActionsService } from './product-actions.service';
import { WishlistService } from './wishlist.service';

describe('ProductActionsService', () => {
  const product = createMockProduct();
  let cartItems: WritableSignal<Product[]>;
  let wishlistItems: WritableSignal<Product[]>;
  let cart: {
    cartItemsSignal: typeof cartItems;
    addToCart: jest.Mock;
    removeFromCart: jest.Mock;
  };
  let wishlist: {
    wishListItemsSignal: typeof wishlistItems;
    addWishListItem: jest.Mock;
    removeWishListItem: jest.Mock;
  };
  let notifications: { add: jest.Mock };
  let service: ProductActionsService;

  beforeEach(() => {
    cartItems = signal([]);
    wishlistItems = signal([]);
    cart = {
      cartItemsSignal: cartItems,
      addToCart: jest.fn(() => true),
      removeFromCart: jest.fn(() => true),
    };
    wishlist = {
      wishListItemsSignal: wishlistItems,
      addWishListItem: jest.fn(() => true),
      removeWishListItem: jest.fn(() => true),
    };
    notifications = { add: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        ProductActionsService,
        { provide: CartService, useValue: cart },
        { provide: WishlistService, useValue: wishlist },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    service = TestBed.inject(ProductActionsService);
  });

  it('reflects cart and wishlist signal state', () => {
    expect(service.inCart(product.id)).toBe(false);
    expect(service.inWishlist(product.id)).toBe(false);

    cartItems.set([product]);
    wishlistItems.set([product]);

    expect(service.inCart(product.id)).toBe(true);
    expect(service.inWishlist(product.id)).toBe(true);
  });

  it('adds and removes cart products with feedback', () => {
    expect(service.toggleCart(product)).toBe(true);
    expect(cart.addToCart).toHaveBeenCalledWith(product);

    cartItems.set([product]);
    expect(service.toggleCart(product)).toBe(true);
    expect(cart.removeFromCart).toHaveBeenCalledWith(product);
    expect(notifications.add).toHaveBeenCalledTimes(2);
  });

  it('reports a failed cart toggle', () => {
    cart.addToCart.mockReturnValue(false);

    expect(service.toggleCart(product)).toBe(false);
    expect(notifications.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('adds a product directly with feedback', () => {
    expect(service.addToCart(product)).toBe(true);
    expect(notifications.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('reports a failed direct cart add', () => {
    cart.addToCart.mockReturnValue(false);

    expect(service.addToCart(product)).toBe(false);
    expect(notifications.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
  });

  it('adds and removes wishlist products with feedback', () => {
    expect(service.toggleWishlist(product)).toBe(true);
    expect(wishlist.addWishListItem).toHaveBeenCalledWith(product);

    wishlistItems.set([product]);
    expect(service.toggleWishlist(product)).toBe(true);
    expect(wishlist.removeWishListItem).toHaveBeenCalledWith(product);
    expect(notifications.add).toHaveBeenCalledTimes(2);
  });

  it('reports a failed wishlist toggle', () => {
    wishlist.addWishListItem.mockReturnValue(false);

    expect(service.toggleWishlist(product)).toBe(false);
    expect(notifications.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });
});
