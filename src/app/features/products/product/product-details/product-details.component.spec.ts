import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NotificationService } from 'src/app/shared/notification.service';

import { ProductDetailsComponent } from './product-details.component';
import { ProductsService } from '../../products.service';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { mockProducts } from 'src/app/testing/mock-data';
import { of, throwError } from 'rxjs';

/**
 * The CLI stub threw `No provider for Apollo!` via ProductsService and also
 * needed Router/ActivatedRoute/Location/MessageService. The constructor reads
 * `router.getCurrentNavigation()`, so that spy returns null (the "navigated
 * directly / reloaded" path). Covered: construction, the installment helper, the
 * cart handoffs, and back-navigation.
 */
describe('ProductDetailsComponent', () => {
    let component: ProductDetailsComponent;
    let fixture: ComponentFixture<ProductDetailsComponent>;
    let cart: any;
    let location: any;
    let router: any;
    let products: any;
    let wishlist: any;
    let images: any;
    let messages: any;

    beforeEach(async () => {
        products = {
            getProductById: jest.fn().mockName("ProductsService.getProductById"),
            getProductsByCategory: jest.fn().mockName("ProductsService.getProductsByCategory")
        };
        wishlist = {
            inWishlist: jest.fn().mockName("WishlistService.inWishlist"),
            addWishListItem: jest.fn().mockName("WishlistService.addWishListItem"),
            removeWishListItem: jest.fn().mockName("WishlistService.removeWishListItem")
        };
        cart = {
            addToCart: jest.fn().mockName("CartService.addToCart"),
            removeFromCart: jest.fn().mockName("CartService.removeFromCart")
        };
        images = {
            normalizeImages: jest.fn().mockName("ProductImageService.normalizeImages"),
            resolvePrimaryImage: jest.fn().mockName("ProductImageService.resolvePrimaryImage"),
            handleImageError: jest.fn().mockName("ProductImageService.handleImageError")
        };
        products.getProductById.mockReturnValue(of({ data: { product: [mockProducts[0]] } }));
        products.getProductsByCategory.mockReturnValue(of({ data: { product: mockProducts } }));
        wishlist.inWishlist.mockReturnValue(false);
        images.normalizeImages.mockImplementation((value: string[]) => value ?? ['fallback.jpg']);
        images.resolvePrimaryImage.mockReturnValue('resolved.jpg');
        images.handleImageError.mockImplementation((event: Event) => {
            const target = event.target as HTMLImageElement | null;
            if (target) target.src = 'fallback.jpg';
        });
        messages = { add: jest.fn().mockName('NotificationService.add') };
        location = {
            back: jest.fn().mockName("Location.back")
        };
        router = {
            navigate: jest.fn().mockName("Router.navigate"),
            getCurrentNavigation: jest.fn().mockName("Router.getCurrentNavigation")
        };
        router.getCurrentNavigation.mockReturnValue(null);

        await TestBed.configureTestingModule({
    imports: [ProductDetailsComponent],
    providers: [
        { provide: ProductsService, useValue: products },
        { provide: WishlistService, useValue: wishlist },
        { provide: CartService, useValue: cart },
        { provide: ProductImageService, useValue: images },
        { provide: Location, useValue: location },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: 1 } } } },
        { provide: NotificationService, useValue: messages },
    ],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();

        fixture = TestBed.createComponent(ProductDetailsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getInstallmentAmount floors price / months', () => {
        expect(component.getInstallmentAmount(1200, 12)).toBe(100);
        expect(component.getInstallmentAmount(1000, 24)).toBe(41); // 41.6 -> 41
    });

    it('navigateBack uses Location.back', () => {
        component.navigateBack();
        expect(location.back).toHaveBeenCalled();
    });

    it('addToCart / removeFromCart delegate to CartService', () => {
        component.addToCart(mockProducts[0]);
        expect(cart.addToCart).toHaveBeenCalledTimes(1);
        expect(cart.addToCart).toHaveBeenCalledWith(mockProducts[0]);

        component.removeFromCart(mockProducts[0]);
        expect(cart.removeFromCart).toHaveBeenCalledTimes(1);
        expect(cart.removeFromCart).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('keeps the existing public navigation API', () => {
        component.openProductDetails(42);
        expect(router.navigate).toHaveBeenCalledWith(['/product', 42]);
    });

    it('loads a directly visited product and related suggestions', () => {
        component.ngOnInit();

        expect(products.getProductById).toHaveBeenCalledWith(1);
        expect(component.product.id).toBe(mockProducts[0].id);
        expect(component.suggestedProducts.every((product: any) => product.id !== component.id)).toBe(true);
        expect(component.items[1].label).toBe(component.product.name);
        expect(component.home.routerLink).toBe('/home');
    });

    it('redirects to 404 when a directly requested product does not exist', () => {
        products.getProductById.mockReturnValue(of({ data: { product: [] } }));
        const missingComponent = TestBed.createComponent(ProductDetailsComponent).componentInstance;

        missingComponent.ngOnInit();

        expect(router.navigate).toHaveBeenCalledWith(['/404']);
    });

    it('shows an error notification when a product request fails', () => {
        products.getProductById.mockReturnValue(throwError(() => new Error('offline')));
        const errorComponent = TestBed.createComponent(ProductDetailsComponent).componentInstance;

        errorComponent.ngOnInit();

        expect(messages.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('uses product data passed through router navigation state', () => {
        router.getCurrentNavigation.mockReturnValue({ extras: { state: { product: mockProducts[0] } } });
        const stateComponent = TestBed.createComponent(ProductDetailsComponent).componentInstance;

        stateComponent.ngOnInit();

        expect(stateComponent.product.id).toBe(mockProducts[0].id);
        expect(products.getProductById).not.toHaveBeenCalled();
        expect(products.getProductsByCategory).toHaveBeenCalled();
    });

    it('uses an empty suggestion list when the product has no category', () => {
        const product = { ...mockProducts[0], category: undefined };
        router.getCurrentNavigation.mockReturnValue({ extras: { state: { product } } });

        const stateComponent = TestBed.createComponent(ProductDetailsComponent).componentInstance;

        expect(stateComponent.suggestedProducts).toEqual([]);
    });

    it('loads a direct product without category metadata', () => {
        products.getProductById.mockReturnValue(of({
            data: { product: [{ ...mockProducts[0], category: undefined }] },
        }));
        const directComponent = TestBed.createComponent(ProductDetailsComponent).componentInstance;

        directComponent.ngOnInit();

        expect(directComponent.suggestedProducts).toEqual([]);
    });

    it('recovers when loading related suggestions fails', () => {
        products.getProductsByCategory.mockReturnValue(throwError(() => new Error('offline')));
        router.getCurrentNavigation.mockReturnValue({ extras: { state: { product: mockProducts[0] } } });

        const stateComponent = TestBed.createComponent(ProductDetailsComponent).componentInstance;

        expect(stateComponent.suggestedProducts).toEqual([]);
    });

    it('selects a responsive visible-item count', () => {
        Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
        expect(component.getNumVisible()).toBe(1);
        Object.defineProperty(window, 'innerWidth', { value: 700, configurable: true });
        expect(component.getNumVisible()).toBe(2);
        Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
        expect(component.getNumVisible()).toBe(3);
    });

    it('adds and removes a product from the wishlist with feedback', () => {
        wishlist.inWishlist.mockReturnValueOnce(false).mockReturnValueOnce(true);

        component.addProductToWishList(mockProducts[0]);
        expect(wishlist.addWishListItem).toHaveBeenCalledWith(mockProducts[0]);
        expect(component.inWishlist).toBe(true);

        component.addProductToWishList(mockProducts[0]);
        expect(wishlist.removeWishListItem).toHaveBeenCalledWith(mockProducts[0]);
        expect(component.inWishlist).toBe(false);
        expect(messages.add).toHaveBeenCalledTimes(2);
    });

    it('preserves the public wishlist delegation methods', () => {
        component.addToWishlist(mockProducts[0]);
        component.removeFromWishlist(mockProducts[0]);

        expect(wishlist.addWishListItem).toHaveBeenCalledWith(mockProducts[0]);
        expect(wishlist.removeWishListItem).toHaveBeenCalledWith(mockProducts[0]);
        expect(component.checkIfInWishlist(mockProducts[0])).toBe(false);
        expect(component.checkInWishlist(mockProducts[0].id)).toBe(false);
    });

    it('replaces a product from suggestions and ignores unknown ids', () => {
        component.suggestedProducts = [mockProducts[1]];
        const scroll = jest.spyOn(window, 'scrollTo').mockReturnValue(undefined);

        component.replaceProduct(mockProducts[1].id);
        expect(component.product.id).toBe(mockProducts[1].id);
        expect(router.navigate).toHaveBeenCalledWith(['/product', mockProducts[1].id]);
        expect(scroll).toHaveBeenCalled();

        router.navigate.mockClear();
        component.replaceProduct(9999);
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('buys a product and moves to the cart', () => {
        component.buyProduct(mockProducts[0]);

        expect(cart.addToCart).toHaveBeenCalledWith(mockProducts[0]);
        expect(router.navigate).toHaveBeenCalledWith(['/cart']);
    });

    it('updates the selected gallery image and persists image fallbacks', () => {
        component.images = ['first.jpg', 'second.jpg'];
        component.product = mockProducts[0];
        const image = { src: 'broken.jpg' } as HTMLImageElement;

        component.imageClick(1);
        component.onGalleryImageError({ target: image } as unknown as Event, 1);

        expect(component.activeIndex).toBe(1);
        expect(component.images[1]).toBe('fallback.jpg');

        component.product = null;
        expect(() => component.onGalleryImageError({ target: null } as unknown as Event, 0)).not.toThrow();
    });
});
