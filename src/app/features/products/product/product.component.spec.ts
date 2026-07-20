import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/shared/notification.service';

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
 * right notification), the installment maths, the route-dependent branch in
 * `openProductDetails`, and the image getter. Logic is driven by calling methods
 * directly rather than asserting on presentation markup, so the tests don't
 * break when markup/classes change.
 */
describe('ProductComponent', () => {
    let component: ProductComponent;
    let fixture: ComponentFixture<ProductComponent>;

    let wishlist: any;
    let cart: any;
    let images: any;
    let messages: any;
    let router: any;
    let route: {
        snapshot: {
            url: string[];
        };
    };

    beforeEach(async () => {
        wishlist = {
            inWishlist: vi.fn().mockName("WishlistService.inWishlist"),
            addWishListItem: vi.fn().mockName("WishlistService.addWishListItem"),
            removeWishListItem: vi.fn().mockName("WishlistService.removeWishListItem")
        };
        cart = {
            inCart: vi.fn().mockName("CartService.inCart"),
            addToCart: vi.fn().mockName("CartService.addToCart"),
            removeFromCart: vi.fn().mockName("CartService.removeFromCart")
        };
        images = {
            normalizeImages: vi.fn().mockName("ProductImageService.normalizeImages"),
            resolvePrimaryImage: vi.fn().mockName("ProductImageService.resolvePrimaryImage"),
            handleImageError: vi.fn().mockName("ProductImageService.handleImageError")
        };
        messages = {
            add: vi.fn().mockName("MessageService.add")
        };
        router = {
            navigate: vi.fn().mockName("Router.navigate")
        };
        route = { snapshot: { url: ['products', 'search'] } };

        wishlist.inWishlist.mockReturnValue(false);
        cart.inCart.mockReturnValue(false);
        images.normalizeImages.mockReturnValue(['primary.jpg', 'secondary.jpg']);
        images.resolvePrimaryImage.mockReturnValue('primary.jpg');

        await TestBed.configureTestingModule({
    imports: [ProductComponent],
    providers: [
        { provide: WishlistService, useValue: wishlist },
        { provide: CartService, useValue: cart },
        { provide: ProductImageService, useValue: images },
        { provide: NotificationService, useValue: messages },
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
            expect(component.product).toEqual(expect.objectContaining({ id: 1, name: 'iPhone 13 Pro', price: 1200 }));
        });

        it('reflects the services current wishlist/cart membership', () => {
            wishlist.inWishlist.mockReturnValue(true);
            cart.inCart.mockReturnValue(true);

            component.ngOnInit();

            expect(component.inWishlist).toBe(true);
            expect(component.inCart).toBe(true);
        });
    });

    describe('addRemoveItemWishlist', () => {
        it('adds: flips state on, emits addedToWishList and shows a success toast', () => {
            const product = createMockProduct({ id: 1 });
            component.inWishlist = false;
            const addedSpy = vi.spyOn(component.addedToWishList, 'emit').mockReturnValue(undefined);

            component.addRemoveItemWishlist(product);

            expect(component.inWishlist).toBe(true);
            expect(addedSpy).toHaveBeenCalledTimes(1);
            expect(addedSpy).toHaveBeenCalledWith(product);
            expect(messages.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', detail: 'Added to wishlist' }));
        });

        it('removes: flips state off, emits removedFromWishList and shows an info toast', () => {
            const product = createMockProduct({ id: 1 });
            component.inWishlist = true;
            const removedSpy = vi.spyOn(component.removedFromWishList, 'emit').mockReturnValue(undefined);

            component.addRemoveItemWishlist(product);

            expect(component.inWishlist).toBe(false);
            expect(removedSpy).toHaveBeenCalledTimes(1);
            expect(removedSpy).toHaveBeenCalledWith(product);
            expect(messages.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'info', detail: 'Removed from wishlist' }));
        });
    });

    describe('addRemoveCartItem', () => {
        it('adds to cart: flips state on, emits addedToCart and shows a success toast', () => {
            const product = createMockProduct({ id: 1 });
            component.inCart = false;
            const addedSpy = vi.spyOn(component.addedToCart, 'emit').mockReturnValue(undefined);

            component.addRemoveCartItem(product);

            expect(component.inCart).toBe(true);
            expect(addedSpy).toHaveBeenCalledTimes(1);
            expect(addedSpy).toHaveBeenCalledWith(product);
            expect(messages.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', detail: 'Added to cart' }));
        });

        it('removes from cart: flips state off and emits removedFromCart', () => {
            const product = createMockProduct({ id: 1 });
            component.inCart = true;
            const removedSpy = vi.spyOn(component.removedFromCart, 'emit').mockReturnValue(undefined);

            component.addRemoveCartItem(product);

            expect(component.inCart).toBe(false);
            expect(removedSpy).toHaveBeenCalledTimes(1);
            expect(removedSpy).toHaveBeenCalledWith(product);
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

            expect(router.navigate).toHaveBeenCalledWith(['/product', 42], expect.objectContaining({ state: { product: component.product } }));
        });

        it('emits replaceCurrentProduct and scrolls up when not on a products route', () => {
            const replaceSpy = vi.spyOn(component.replaceCurrentProduct, 'emit').mockReturnValue(undefined);
            const scrollSpy = vi.spyOn(window, 'scrollTo').mockReturnValue(undefined);
            route.snapshot.url = ['home'];

            component.openProductDetails(7);

            expect(replaceSpy).toHaveBeenCalledTimes(1);

            expect(replaceSpy).toHaveBeenCalledWith(7);
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
