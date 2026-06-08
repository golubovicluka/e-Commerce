import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { HeaderComponent } from './header.component';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { of } from 'rxjs';
import { mockProducts } from 'src/app/testing/mock-data';

/**
 * The CLI stub failed at `detectChanges()` (NG0304: `p-slideMenu` unknown) and
 * would also have failed DI on Router. We provide doubles for all three
 * dependencies and cover the counter wiring plus the active-route check.
 */
describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let wishlist: jasmine.SpyObj<WishlistService>;
  let cart: jasmine.SpyObj<CartService>;
  let router: { url: string };

  beforeEach(async () => {
    wishlist = jasmine.createSpyObj('WishlistService', ['getWishListItems']);
    cart = jasmine.createSpyObj('CartService', ['getCartItems']);
    wishlist.getWishListItems.and.returnValue(of([mockProducts[0]]));
    cart.getCartItems.and.returnValue(of([mockProducts[0], mockProducts[1]]));
    router = { url: '/home' };

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: WishlistService, useValue: wishlist },
        { provide: CartService, useValue: cart },
        { provide: Router, useValue: router },
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
    expect(component.isActiveRoute('/home')).toBeTrue();
    expect(component.isActiveRoute('/cart')).toBeFalse();
  });
});
