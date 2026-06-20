import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { WishlistViewComponent } from './wishlist-view.component';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { mockProducts } from 'src/app/testing/mock-data';

describe('WishlistViewComponent', () => {
  let component: WishlistViewComponent;
  let fixture: ComponentFixture<WishlistViewComponent>;
  let wishlist: jasmine.SpyObj<WishlistService>;
  let cart: jasmine.SpyObj<CartService>;

  beforeEach(async () => {
    wishlist = jasmine.createSpyObj('WishlistService', ['getWishListItems', 'removeWishListItem', 'inWishlist']);
    cart = jasmine.createSpyObj('CartService', ['addToCart', 'removeFromCart']);
    wishlist.getWishListItems.and.returnValue(of([mockProducts[0], mockProducts[1]]));
    wishlist.inWishlist.and.returnValue(true);

    await TestBed.configureTestingModule({
      declarations: [WishlistViewComponent],
      providers: [
        { provide: WishlistService, useValue: wishlist },
        { provide: CartService, useValue: cart },
        MessageService,
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
    expect(cart.addToCart).toHaveBeenCalledOnceWith(mockProducts[0]);
  });

  it('removeFromCart delegates to CartService', () => {
    component.removeFromCart(mockProducts[0]);
    expect(cart.removeFromCart).toHaveBeenCalledOnceWith(mockProducts[0]);
  });

  it('removeFromWishlist removes the clicked product via WishlistService', () => {
    component.removeFromWishlist(mockProducts[1]);
    expect(wishlist.removeWishListItem).toHaveBeenCalledOnceWith(mockProducts[1]);
  });

  it('trackByProductId returns the product id', () => {
    expect(component.trackByProductId(0, mockProducts[2])).toBe(mockProducts[2].id);
  });
});
