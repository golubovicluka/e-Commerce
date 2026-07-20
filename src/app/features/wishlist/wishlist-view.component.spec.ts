import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { of } from 'rxjs';

import { WishlistViewComponent } from './wishlist-view.component';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { mockProducts } from 'src/app/testing/mock-data';

describe('WishlistViewComponent', () => {
    let component: WishlistViewComponent;
    let fixture: ComponentFixture<WishlistViewComponent>;
    let wishlist: any;
    let cart: any;

    beforeEach(async () => {
        wishlist = {
            getWishListItems: jest.fn().mockName("WishlistService.getWishListItems"),
            removeWishListItem: jest.fn().mockName("WishlistService.removeWishListItem"),
            inWishlist: jest.fn().mockName("WishlistService.inWishlist"),
            wishListItemsSignal: signal([mockProducts[0], mockProducts[1]]),
        };
        cart = {
            addToCart: jest.fn().mockName("CartService.addToCart"),
            removeFromCart: jest.fn().mockName("CartService.removeFromCart")
        };
        wishlist.getWishListItems.mockReturnValue(of([mockProducts[0], mockProducts[1]]));
        wishlist.inWishlist.mockReturnValue(true);

        await TestBed.configureTestingModule({
    imports: [WishlistViewComponent],
    providers: [
        { provide: WishlistService, useValue: wishlist },
        { provide: CartService, useValue: cart },
        NotificationService,
    ],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();

        fixture = TestBed.createComponent(WishlistViewComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit loads the wishlist items from the service', () => {
        component.ngOnInit();
        expect(component.wishlistItems).toEqual([mockProducts[0], mockProducts[1]]);
    });

    it('isInWishlist delegates to WishlistService', () => {
        expect(component.isInWishlist(42)).toBe(true);
        expect(wishlist.inWishlist).toHaveBeenCalledWith(42);
    });

    it('addToCart delegates to CartService', () => {
        component.addToCart(mockProducts[0]);
        expect(cart.addToCart).toHaveBeenCalledTimes(1);
        expect(cart.addToCart).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('removeFromCart delegates to CartService', () => {
        component.removeFromCart(mockProducts[0]);
        expect(cart.removeFromCart).toHaveBeenCalledTimes(1);
        expect(cart.removeFromCart).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('removeFromWishlist removes the clicked product via WishlistService', () => {
        component.removeFromWishlist(mockProducts[1]);
        expect(wishlist.removeWishListItem).toHaveBeenCalledTimes(1);
        expect(wishlist.removeWishListItem).toHaveBeenCalledWith(mockProducts[1]);
    });

    it('trackByProductId returns the product id', () => {
        expect(component.trackByProductId(0, mockProducts[2])).toBe(mockProducts[2].id);
    });
});
