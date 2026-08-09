import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { CartService } from 'src/app/shared/cart.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { createMockProduct, mockProducts } from 'src/app/testing/mock-data';
import { ProductsService } from '../../products.service';
import { ProductDetailsComponent } from './product-details.component';

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let fixture: ComponentFixture<ProductDetailsComponent>;
  let routeParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let products: {
    getProductById: jest.Mock;
    getRelatedProducts: jest.Mock;
  };
  let wishlist: {
    inWishlist: jest.Mock;
    addWishListItem: jest.Mock;
    removeWishListItem: jest.Mock;
  };
  let cart: {
    addToCart: jest.Mock;
    removeFromCart: jest.Mock;
  };
  let images: {
    normalizeImages: jest.Mock;
    handleImageError: jest.Mock;
  };
  let notifications: { add: jest.Mock };
  let router: { navigate: jest.Mock };

  beforeEach(async () => {
    routeParams = new BehaviorSubject(convertToParamMap({ id: '1' }));
    products = {
      getProductById: jest.fn(() => of({ data: { product: [mockProducts[0]] } })),
      getRelatedProducts: jest.fn(() => of({ data: { product: mockProducts.slice(1) } })),
    };
    wishlist = {
      inWishlist: jest.fn(() => false),
      addWishListItem: jest.fn(() => true),
      removeWishListItem: jest.fn(() => true),
    };
    cart = {
      addToCart: jest.fn(() => true),
      removeFromCart: jest.fn(() => true),
    };
    images = {
      normalizeImages: jest.fn((value: string[]) => value),
      handleImageError: jest.fn((event: Event) => {
        const target = event.target as HTMLImageElement | null;
        if (target) {
          target.src = 'fallback.jpg';
        }
      }),
    };
    notifications = { add: jest.fn() };
    router = { navigate: jest.fn(() => Promise.resolve(true)) };

    await TestBed.configureTestingModule({
      imports: [ProductDetailsComponent],
      providers: [
        { provide: ProductsService, useValue: products },
        { provide: WishlistService, useValue: wishlist },
        { provide: CartService, useValue: cart },
        { provide: ProductImageService, useValue: images },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { paramMap: routeParams.asObservable() } },
        { provide: NotificationService, useValue: notifications },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;
  });

  it('loads the route product and bounded suggestions', () => {
    component.ngOnInit();

    expect(products.getProductById).toHaveBeenCalledWith(1);
    expect(products.getRelatedProducts).toHaveBeenCalledWith('Electronics', 1);
    expect(component.product).toEqual(expect.objectContaining({ id: 1 }));
    expect(component.loadState).toBe('ready');
    expect(component.suggestionsLoadState).toBe('ready');
    expect(component.items[1].label).toBe(mockProducts[0].name);
    expect(component.activeIndex).toBe(0);
  });

  it('reloads when the route id changes and ignores duplicate emissions', () => {
    products.getProductById.mockImplementation((id: number) =>
      of({ data: { product: [createMockProduct({ id, name: `Product ${id}` })] } }),
    );
    component.ngOnInit();

    routeParams.next(convertToParamMap({ id: '2' }));
    routeParams.next(convertToParamMap({ id: '2' }));

    expect(component.product?.id).toBe(2);
    expect(products.getProductById).toHaveBeenCalledTimes(2);
  });

  it('cancels a stale request when the route changes', () => {
    const firstRequest = new Subject<{ data: { product: typeof mockProducts } }>();
    products.getProductById
      .mockReturnValueOnce(firstRequest)
      .mockReturnValueOnce(of({ data: { product: [mockProducts[1]] } }));
    component.ngOnInit();

    routeParams.next(convertToParamMap({ id: '2' }));
    firstRequest.next({ data: { product: [mockProducts[0]] } });

    expect(component.product?.id).toBe(mockProducts[1].id);
  });

  it.each(['foo', '0', '-1', '1.5'])('redirects an invalid product id: %s', (id) => {
    routeParams.next(convertToParamMap({ id }));

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/404']);
    expect(products.getProductById).not.toHaveBeenCalled();
  });

  it('redirects when a valid product does not exist', () => {
    products.getProductById.mockReturnValue(of({ data: { product: [] } }));

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/404']);
  });

  it('redirects when Apollo returns no data payload', () => {
    products.getProductById.mockReturnValue(of({ data: undefined }));

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/404']);
  });

  it('shows a recoverable error and retries the current product', () => {
    products.getProductById
      .mockReturnValueOnce(throwError(() => new Error('offline')))
      .mockReturnValueOnce(of({ data: { product: [mockProducts[0]] } }));
    component.ngOnInit();

    expect(component.loadState).toBe('error');
    expect(notifications.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));

    component.retryProductLoad();

    expect(component.loadState).toBe('ready');
    expect(products.getProductById).toHaveBeenCalledTimes(2);
  });

  it('keeps suggestions empty when category metadata is absent', () => {
    products.getProductById.mockReturnValue(of({
      data: { product: [createMockProduct({ category: undefined })] },
    }));

    component.ngOnInit();

    expect(component.suggestedProducts).toEqual([]);
    expect(component.suggestionsLoadState).toBe('ready');
    expect(products.getRelatedProducts).not.toHaveBeenCalled();
  });

  it('recovers when related products cannot be loaded', () => {
    products.getRelatedProducts.mockReturnValue(throwError(() => new Error('offline')));

    component.ngOnInit();

    expect(component.suggestedProducts).toEqual([]);
    expect(component.suggestionsLoadState).toBe('error');
  });

  it('treats a missing related-products payload as an empty result', () => {
    products.getRelatedProducts.mockReturnValue(of({ data: undefined }));

    component.ngOnInit();

    expect(component.suggestedProducts).toEqual([]);
    expect(component.suggestionsLoadState).toBe('ready');
  });

  it('adds and removes wishlist items only after persistence succeeds', () => {
    component.ngOnInit();

    component.addProductToWishList(mockProducts[0]);
    expect(component.inWishlist).toBe(true);
    expect(wishlist.addWishListItem).toHaveBeenCalledWith(mockProducts[0]);

    wishlist.inWishlist.mockReturnValue(true);
    component.addProductToWishList(mockProducts[0]);
    expect(component.inWishlist).toBe(false);
    expect(wishlist.removeWishListItem).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('reports a wishlist persistence failure without changing UI state', () => {
    wishlist.addWishListItem.mockReturnValue(false);
    component.ngOnInit();

    component.addProductToWishList(mockProducts[0]);

    expect(component.inWishlist).toBe(false);
    expect(notifications.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('delegates card events to cart and wishlist services', () => {
    component.addToCart(mockProducts[0]);
    component.removeFromCart(mockProducts[0]);
    component.addToWishList(mockProducts[0]);
    component.removedFromWishList(mockProducts[0]);

    expect(cart.addToCart).toHaveBeenCalledWith(mockProducts[0]);
    expect(cart.removeFromCart).toHaveBeenCalledWith(mockProducts[0]);
    expect(wishlist.addWishListItem).toHaveBeenCalledWith(mockProducts[0]);
    expect(wishlist.removeWishListItem).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('navigates only to known suggested products', () => {
    component.suggestedProducts = [mockProducts[1]];
    const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    component.replaceProduct(999);
    expect(router.navigate).not.toHaveBeenCalled();

    component.replaceProduct(mockProducts[1].id);
    expect(router.navigate).toHaveBeenCalledWith(['/product', mockProducts[1].id]);
    expect(scrollSpy).toHaveBeenCalled();
  });

  it('moves to cart only after a successful cart update', () => {
    component.buyProduct(mockProducts[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/cart']);

    router.navigate.mockClear();
    cart.addToCart.mockReturnValue(false);
    component.buyProduct(mockProducts[0]);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(notifications.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
  });

  it('persists image fallbacks in the current product', () => {
    component.ngOnInit();
    component.images = ['first.jpg', 'second.jpg'];
    component.product = { ...component.product!, images: component.images };
    const image = { src: 'broken.jpg' } as HTMLImageElement;

    component.onGalleryImageError({ target: image } as unknown as Event, 0);

    expect(component.images[0]).toBe('fallback.jpg');
    expect(component.images[1]).toBe('second.jpg');
    expect(component.product?.images[0]).toBe('fallback.jpg');
  });

  it('ignores image fallback updates without a resolved image source', () => {
    component.product = null;

    component.onGalleryImageError({ target: null } as unknown as Event, 0);

    expect(component.product).toBeNull();
  });

  it('exposes precise installment amounts', () => {
    expect(component.getInstallmentAmount(1000, 24)).toBe(41.66);
  });
});
