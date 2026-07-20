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

    beforeEach(async () => {
        const products = {
            getProductById: vi.fn().mockName("ProductsService.getProductById"),
            getProductsByCategory: vi.fn().mockName("ProductsService.getProductsByCategory")
        };
        const wishlist = {
            inWishlist: vi.fn().mockName("WishlistService.inWishlist"),
            addWishListItem: vi.fn().mockName("WishlistService.addWishListItem"),
            removeWishListItem: vi.fn().mockName("WishlistService.removeWishListItem")
        };
        cart = {
            addToCart: vi.fn().mockName("CartService.addToCart"),
            removeFromCart: vi.fn().mockName("CartService.removeFromCart")
        };
        const images = {
            normalizeImages: vi.fn().mockName("ProductImageService.normalizeImages"),
            resolvePrimaryImage: vi.fn().mockName("ProductImageService.resolvePrimaryImage"),
            handleImageError: vi.fn().mockName("ProductImageService.handleImageError")
        };
        location = {
            back: vi.fn().mockName("Location.back")
        };
        router = {
            navigate: vi.fn().mockName("Router.navigate"),
            getCurrentNavigation: vi.fn().mockName("Router.getCurrentNavigation")
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
        NotificationService,
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
});
