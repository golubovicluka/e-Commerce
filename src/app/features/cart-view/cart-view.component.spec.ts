import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { CartViewComponent } from './cart-view.component';
import { CartService } from 'src/app/shared/cart.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { of } from 'rxjs';

describe('CartViewComponent', () => {
    let component: CartViewComponent;
    let fixture: ComponentFixture<CartViewComponent>;
    let cart: any;
    let router: any;
    let images: any;
    let route: {
        firstChild: {
            snapshot: {
                url: {
                    path: string;
                }[];
            };
        } | null;
    };

    beforeEach(async () => {
        cart = {
            getCartItems: jest.fn().mockName("CartService.getCartItems"),
            getCartLines: jest.fn().mockName("CartService.getCartLines"),
            getTotalPrice: jest.fn().mockName("CartService.getTotalPrice"),
            getProductIndex: jest.fn().mockName("CartService.getProductIndex"),
            setQuantityAtIndex: jest.fn().mockName("CartService.setQuantityAtIndex"),
            removeFromCart: jest.fn().mockName("CartService.removeFromCart"),
            cartLinesSignal: signal([]),
            totalPriceSignal: signal(0),
            numberOfItemsSignal: signal(0),
        };
        cart.getCartItems.mockReturnValue(of([]));
        cart.getCartLines.mockReturnValue(of([]));
        cart.getTotalPrice.mockReturnValue(of(0));
        cart.getProductIndex.mockReturnValue(0);
        router = {
            navigate: jest.fn().mockName("Router.navigate"),
            events: new Subject()
        };
        images = {
            resolvePrimaryImage: jest.fn().mockName('ProductImageService.resolvePrimaryImage'),
            handleImageError: jest.fn().mockName('ProductImageService.handleImageError'),
        };
        route = { firstChild: null };

        await TestBed.configureTestingModule({
    imports: [CartViewComponent],
    providers: [
        { provide: CartService, useValue: cart },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        {
            provide: ProductImageService,
            useValue: images,
        },
    ],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();

        fixture = TestBed.createComponent(CartViewComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openShippingView navigates to shipping when checkout is inactive', () => {
        component.checkoutActive = false;
        component.openShippingView();
        expect(router.navigate).toHaveBeenCalledWith(['/cart/shipping']);
    });

    it('openShippingView navigates back to cart when checkout is active', () => {
        component.checkoutActive = true;
        component.openShippingView();
        expect(router.navigate).toHaveBeenCalledWith(['/cart']);
    });

    it('checkoutCtaLabel reflects checkout state', () => {
        component.checkoutActive = false;
        expect(component.checkoutCtaLabel).toBe('Proceed with shipping');
        component.checkoutActive = true;
        expect(component.checkoutCtaLabel).toBe('Back to cart view');
    });

    it('exposes the cart item count and updates the active step', () => {
        cart.numberOfItemsSignal.set(3);
        component.onActiveIndexChange(2);

        expect(component.numberOfItems).toBe(3);
        expect(component.activeIndex).toBe(2);
    });

    it('increments only in-stock products with a valid cart row', () => {
        component.incrementProductCount(7, 5, 2);
        expect(cart.setQuantityAtIndex).toHaveBeenCalledWith(0, 3);

        cart.setQuantityAtIndex.mockClear();
        component.incrementProductCount(7, 2, 2);
        expect(cart.setQuantityAtIndex).not.toHaveBeenCalled();

        cart.getProductIndex.mockReturnValue(-1);
        component.incrementProductCount(7, 5, 2);
        expect(cart.setQuantityAtIndex).not.toHaveBeenCalled();
    });

    it('decrements quantities above one when the cart row exists', () => {
        component.decrementProductCount(7, 3);
        expect(cart.setQuantityAtIndex).toHaveBeenCalledWith(0, 2);

        cart.setQuantityAtIndex.mockClear();
        component.decrementProductCount(7, 1);
        expect(cart.setQuantityAtIndex).not.toHaveBeenCalled();

        cart.getProductIndex.mockReturnValue(-1);
        component.decrementProductCount(7, 3);
        expect(cart.setQuantityAtIndex).not.toHaveBeenCalled();
    });

    it('accepts a direct quantity change only for an existing row', () => {
        component.onQuantityChange(7, 4);
        expect(cart.setQuantityAtIndex).toHaveBeenCalledWith(0, 4);

        cart.setQuantityAtIndex.mockClear();
        cart.getProductIndex.mockReturnValue(-1);
        component.onQuantityChange(7, 4);
        expect(cart.setQuantityAtIndex).not.toHaveBeenCalled();
    });

    it('updates checkout state from child-route navigation', () => {
        route.firstChild = { snapshot: { url: [{ path: 'overview' }] } };
        router.events.next(new NavigationEnd(1, '/cart/overview', '/cart/overview'));
        expect(component.checkoutActive).toBe(true);
        expect(component.activeIndex).toBe(1);

        route.firstChild = { snapshot: { url: [{ path: 'unknown' }] } };
        router.events.next(new NavigationEnd(2, '/cart/unknown', '/cart/unknown'));
        expect(component.activeIndex).toBe(0);

        route.firstChild = null;
        router.events.next(new NavigationEnd(3, '/cart', '/cart'));
        expect(component.checkoutActive).toBe(false);
    });

    it('delegates cart, product navigation, and image behavior', () => {
        const product = { id: 7, name: 'Phone', images: ['phone.jpg'] } as any;
        images.resolvePrimaryImage.mockReturnValue('resolved.jpg');
        const event = { target: {} } as Event;

        component.removeFromCart(product);
        component.openProductDetails(7);

        expect(cart.removeFromCart).toHaveBeenCalledWith(product);
        expect(router.navigate).toHaveBeenCalledWith(['/product', 7]);
        expect(component.getProductImage(product)).toBe('resolved.jpg');
        component.onProductImageError(event, 'Phone');
        expect(images.handleImageError).toHaveBeenCalledWith(event, 'Phone');
        expect(component.trackByProductId(0, { product, quantity: 1, lineTotal: 1 })).toBe(7);
    });

    it('unsubscribes from router events when destroyed', () => {
        const unsubscribe = jest.spyOn((component as any).routerSubscription, 'unsubscribe');
        component.ngOnDestroy();
        expect(unsubscribe).toHaveBeenCalled();
    });

    it('can be destroyed before the router subscription is initialized', () => {
        (component as any).routerSubscription = undefined;
        expect(() => component.ngOnDestroy()).not.toThrow();
    });
});
