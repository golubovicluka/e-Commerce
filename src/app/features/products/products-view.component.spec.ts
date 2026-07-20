import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductsViewComponent } from './products-view.component';
import { ProductsService } from './products.service';
import { WishlistService } from '../../shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { mockProducts } from 'src/app/testing/mock-data';

/**
 * The CLI stub threw `No provider for Apollo!` via ProductsService. This is the
 * most logic-heavy component in the app; ngOnInit fires multiple queries and a
 * large catalog template, so the smoke test stops at construction (the
 * constructor reads `router.getCurrentNavigation()`, hence the Router spy).
 * Dependency-light behaviour — the trackBy and the wishlist/cart handoffs — is
 * covered directly.
 */
describe('ProductsViewComponent', () => {
    let component: ProductsViewComponent;
    let fixture: ComponentFixture<ProductsViewComponent>;
    let wishlist: any;
    let cart: any;
    let router: any;

    beforeEach(async () => {
        const products = {
            getProducts: vi.fn().mockName("ProductsService.getProducts"),
            getProductCategories: vi.fn().mockName("ProductsService.getProductCategories"),
            searchProducts: vi.fn().mockName("ProductsService.searchProducts"),
            getFilteredProducts: vi.fn().mockName("ProductsService.getFilteredProducts"),
            getProductsByPrice: vi.fn().mockName("ProductsService.getProductsByPrice")
        };
        wishlist = {
            addWishListItem: vi.fn().mockName("WishlistService.addWishListItem"),
            removeWishListItem: vi.fn().mockName("WishlistService.removeWishListItem")
        };
        cart = {
            addToCart: vi.fn().mockName("CartService.addToCart"),
            removeFromCart: vi.fn().mockName("CartService.removeFromCart")
        };
        router = {
            navigate: vi.fn().mockName("Router.navigate"),
            getCurrentNavigation: vi.fn().mockName("Router.getCurrentNavigation")
        };
        router.getCurrentNavigation.mockReturnValue(null);

        await TestBed.configureTestingModule({
    imports: [ProductsViewComponent],
    providers: [
        { provide: ProductsService, useValue: products },
        { provide: WishlistService, useValue: wishlist },
        { provide: CartService, useValue: cart },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
    ],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();

        fixture = TestBed.createComponent(ProductsViewComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('trackByProductId returns the product id', () => {
        expect(component.trackByProductId(0, mockProducts[2])).toBe(mockProducts[2].id);
    });

    it('addToWishList / removedFromWishList delegate to WishlistService', () => {
        component.addToWishList(mockProducts[0]);
        expect(wishlist.addWishListItem).toHaveBeenCalledTimes(1);
        expect(wishlist.addWishListItem).toHaveBeenCalledWith(mockProducts[0]);

        component.removedFromWishList(mockProducts[0]);
        expect(wishlist.removeWishListItem).toHaveBeenCalledTimes(1);
        expect(wishlist.removeWishListItem).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('addToCart / removeFromCart delegate to CartService', () => {
        component.addToCart(mockProducts[1]);
        expect(cart.addToCart).toHaveBeenCalledTimes(1);
        expect(cart.addToCart).toHaveBeenCalledWith(mockProducts[1]);

        component.removeFromCart(mockProducts[1]);
        expect(cart.removeFromCart).toHaveBeenCalledTimes(1);
        expect(cart.removeFromCart).toHaveBeenCalledWith(mockProducts[1]);
    });

    it('openProductDetails navigates to the product route', () => {
        component.openProductDetails(9);
        expect(router.navigate).toHaveBeenCalledWith(['/product', 9]);
    });
});
