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
            getWishListItems: jest.fn().mockName("WishlistService.getWishListItems"),
            wishListItemsSignal: signal([mockProducts[0]]),
        };
        cart = {
            getCartItems: jest.fn().mockName("CartService.getCartItems"),
            numberOfItemsSignal: signal(2),
        };
        wishlist.getWishListItems.mockReturnValue(of([mockProducts[0]]));
        cart.getCartItems.mockReturnValue(of([mockProducts[0], mockProducts[1]]));
        router = {
            url: '/home',
            events: new Subject(),
            navigate: jest.fn().mockName('Router.navigate'),
            createUrlTree: jest.fn().mockReturnValue({}),
            serializeUrl: jest.fn().mockReturnValue('/home'),
            isActive: jest.fn().mockReturnValue(false),
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

    it('searches with a trimmed query and closes the mobile search', () => {
        component.searchQuery = '  laptop  ';
        component.mobileSearchOpen = true;

        component.onSearch();

        expect(component.mobileSearchOpen).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/products/search'], {
            queryParams: { q: 'laptop' },
        });
    });

    it('navigates without a q parameter for an empty search', () => {
        component.searchQuery = '   ';
        component.onSearch();

        expect(router.navigate).toHaveBeenCalledWith(['/products/search'], { queryParams: {} });
    });

    it('opens, focuses, and closes the mobile search', () => {
        const focus = jest.fn();
        component.mobileSearchInput = { nativeElement: { focus } } as any;
        const animationFrame = jest
            .spyOn(globalThis, 'requestAnimationFrame')
            .mockImplementation((callback) => {
                callback(0);
                return 1;
            });

        component.toggleMobileSearch();
        expect(component.mobileSearchOpen).toBe(true);
        expect(focus).toHaveBeenCalledTimes(1);

        component.toggleMobileSearch();
        expect(component.mobileSearchOpen).toBe(false);
        animationFrame.mockRestore();
    });

    it('opens mobile search safely before the input is rendered', () => {
        jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
            callback(0);
            return 1;
        });

        expect(() => component.toggleMobileSearch()).not.toThrow();
    });

    it('toggles the mobile menu', () => {
        component.toggleMobileMenu();
        expect(component.mobileMenuOpen).toBe(true);
        component.toggleMobileMenu();
        expect(component.mobileMenuOpen).toBe(false);
    });
});
