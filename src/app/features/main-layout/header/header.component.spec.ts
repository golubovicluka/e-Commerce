import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { HeaderComponent } from './header.component';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { of } from 'rxjs';
import { Subject } from 'rxjs';
import { mockProducts } from 'src/app/testing/mock-data';

/**
 * The CLI stub failed at `detectChanges()` (NG0304: `p-slideMenu` unknown) and
 * would also have failed DI on Router. We provide doubles for all three
 * dependencies and cover the counter wiring plus the active-route check.
 */
describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let wishlist: any;
    let cart: any;
    let router: any;

    beforeEach(async () => {
        wishlist = {
            getWishListItems: vi.fn().mockName("WishlistService.getWishListItems"),
            wishListItemsSignal: signal([mockProducts[0]]),
        };
        cart = {
            getCartItems: vi.fn().mockName("CartService.getCartItems"),
            numberOfItemsSignal: signal(2),
        };
        wishlist.getWishListItems.mockReturnValue(of([mockProducts[0]]));
        cart.getCartItems.mockReturnValue(of([mockProducts[0], mockProducts[1]]));
        router = {
            url: '/home',
            events: new Subject(),
            createUrlTree: vi.fn().mockReturnValue({}),
            serializeUrl: vi.fn().mockReturnValue('/home'),
            isActive: vi.fn().mockReturnValue(false),
        };

        await TestBed.configureTestingModule({
    imports: [HeaderComponent],
    providers: [
        { provide: WishlistService, useValue: wishlist },
        { provide: CartService, useValue: cart },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
    ],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit reflects wishlist and cart counts as strings', () => {
        component.ngOnInit();
        expect(component.wishListItems).toBe('1');
        expect(component.cartItems).toBe('2');
    });

    it('isActiveRoute matches the current router url', () => {
        expect(component.isActiveRoute('/home')).toBe(true);
        expect(component.isActiveRoute('/cart')).toBe(false);
    });
});
