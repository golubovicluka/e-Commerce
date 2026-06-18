import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';

import { ProductComponent } from './product.component';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { createMockProduct } from 'src/app/testing/mock-data';

/**
 * The original spec was the Angular CLI stub: it declared ProductComponent with
 * no providers and asserted only `toBeTruthy()`. Because the component injects
 * MessageService / Router / ActivatedRoute (none `providedIn: 'root'`) it threw
 * `NullInjectorError: No provider for MessageService!` and never ran.
 *
 * This rewrite provides test doubles for every dependency and covers the actual
 * behaviour: the wishlist/cart toggles (state flip + correct @Output + the
 * right PrimeNG toast), the installment maths, the route-dependent branch in
 * `openProductDetails`, and the image getter. Logic is driven by calling methods
 * directly rather than asserting on the PrimeNG template, so the tests don't
 * break when markup/classes change.
 */
describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;

  let wishlist: jasmine.SpyObj<WishlistService>;
  let cart: jasmine.SpyObj<CartService>;
  let images: jasmine.SpyObj<ProductImageService>;
  let messages: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;
  let route: { snapshot: { url: string[] } };

  beforeEach(async () => {
    wishlist = jasmine.createSpyObj('WishlistService', [
      'inWishlist',
      'addWishListItem',
      'removeWishListItem',
    ]);
    cart = jasmine.createSpyObj('CartService', ['inCart', 'addToCart', 'removeFromCart']);
    images = jasmine.createSpyObj('ProductImageService', [
      'normalizeImages',
      'resolvePrimaryImage',
      'handleImageError',
    ]);
    messages = jasmine.createSpyObj('MessageService', ['add']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    route = { snapshot: { url: ['products', 'search'] } };

    wishlist.inWishlist.and.returnValue(false);
    cart.inCart.and.returnValue(false);
    images.normalizeImages.and.returnValue(['primary.jpg', 'secondary.jpg']);
    images.resolvePrimaryImage.and.returnValue('primary.jpg');

    await TestBed.configureTestingModule({
      declarations: [ProductComponent],
      providers: [
        { provide: WishlistService, useValue: wishlist },
        { provide: CartService, useValue: cart },
        { provide: ProductImageService, useValue: images },
        { provide: MessageService, useValue: messages },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
    component.id = 1;
    component.name = 'iPhone 13 Pro';
    component.price = 1200;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('normalizes images and assembles the product from @Input fields', () => {
      component.description = 'Desc';
      component.images = ['raw.jpg'];

      component.ngOnInit();

      expect(images.normalizeImages).toHaveBeenCalledWith(['raw.jpg'], 'iPhone 13 Pro');
      expect(component.images).toEqual(['primary.jpg', 'secondary.jpg']);
      expect(component.product).toEqual(
        jasmine.objectContaining({ id: 1, name: 'iPhone 13 Pro', price: 1200 })
      );
    });

    it('reflects the services current wishlist/cart membership', () => {
      wishlist.inWishlist.and.returnValue(true);
      cart.inCart.and.returnValue(true);

      component.ngOnInit();

      expect(component.inWishlist).toBeTrue();
      expect(component.inCart).toBeTrue();
    });
  });

  describe('addRemoveItemWishlist', () => {
    it('adds: flips state on, emits addedToWishList and shows a success toast', () => {
      const product = createMockProduct({ id: 1 });
      component.inWishlist = false;
      const addedSpy = spyOn(component.addedToWishList, 'emit');

      component.addRemoveItemWishlist(product);

      expect(component.inWishlist).toBeTrue();
      expect(addedSpy).toHaveBeenCalledOnceWith(product);
      expect(messages.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'success', detail: 'Added to wishlist' })
      );
    });

    it('removes: flips state off, emits removedFromWishList and shows an info toast', () => {
      const product = createMockProduct({ id: 1 });
      component.inWishlist = true;
      const removedSpy = spyOn(component.removedFromWishList, 'emit');

      component.addRemoveItemWishlist(product);

      expect(component.inWishlist).toBeFalse();
      expect(removedSpy).toHaveBeenCalledOnceWith(product);
      expect(messages.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'info', detail: 'Removed from wishlist' })
      );
    });
  });

  describe('addRemoveCartItem', () => {
    it('adds to cart: flips state on, emits addedToCart and shows a success toast', () => {
      const product = createMockProduct({ id: 1 });
      component.inCart = false;
      const addedSpy = spyOn(component.addedToCart, 'emit');

      component.addRemoveCartItem(product);

      expect(component.inCart).toBeTrue();
      expect(addedSpy).toHaveBeenCalledOnceWith(product);
      expect(messages.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'success', detail: 'Added to cart' })
      );
    });

    it('removes from cart: flips state off and emits removedFromCart', () => {
      const product = createMockProduct({ id: 1 });
      component.inCart = true;
      const removedSpy = spyOn(component.removedFromCart, 'emit');

      component.addRemoveCartItem(product);

      expect(component.inCart).toBeFalse();
      expect(removedSpy).toHaveBeenCalledOnceWith(product);
    });
  });

  describe('getInstallmentAmount', () => {
    it('floors price / 12', () => {
      expect(component.getInstallmentAmount(1200, 12)).toBe(100);
      expect(component.getInstallmentAmount(1250, 12)).toBe(104); // 104.16 -> 104
      expect(component.getInstallmentAmount(0, 12)).toBe(0);
    });
  });

  describe('openProductDetails', () => {
    it('navigates with product state when already on a products route', () => {
      component.ngOnInit(); // builds component.product
      route.snapshot.url = ['products', 'search'];

      component.openProductDetails(42);

      expect(router.navigate).toHaveBeenCalledWith(
        ['/product', 42],
        jasmine.objectContaining({ state: { product: component.product } })
      );
    });

    it('emits replaceCurrentProduct and scrolls up when not on a products route', () => {
      const replaceSpy = spyOn(component.replaceCurrentProduct, 'emit');
      const scrollSpy = spyOn(window, 'scrollTo');
      route.snapshot.url = ['home'];

      component.openProductDetails(7);

      expect(replaceSpy).toHaveBeenCalledOnceWith(7);
      expect(scrollSpy).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('image helpers', () => {
    it('primaryImageSrc delegates to ProductImageService.resolvePrimaryImage', () => {
      component.images = ['a.jpg'];
      expect(component.primaryImageSrc).toBe('primary.jpg');
      expect(images.resolvePrimaryImage).toHaveBeenCalledWith(['a.jpg'], 'iPhone 13 Pro');
    });

    it('onImageError delegates to ProductImageService.handleImageError', () => {
      const event = new Event('error');
      component.onImageError(event);
      expect(images.handleImageError).toHaveBeenCalledWith(event, 'iPhone 13 Pro');
    });
  });
});
