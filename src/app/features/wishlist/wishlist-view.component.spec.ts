import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { WishlistViewComponent } from './wishlist-view.component';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { mockProducts } from 'src/app/testing/mock-data';

/**
 * The CLI stub threw `NullInjectorError: No provider for MessageService!`. With
 * doubles in place we also cover ngOnInit populating the wishlist and the
 * cart delegation methods.
 */
describe('WishlistViewComponent', () => {
  let component: WishlistViewComponent;
  let fixture: ComponentFixture<WishlistViewComponent>;
  let wishlist: jasmine.SpyObj<WishlistService>;
  let cart: jasmine.SpyObj<CartService>;

  beforeEach(async () => {
    wishlist = jasmine.createSpyObj('WishlistService', ['getWishListItems', 'removeWishListItem']);
    cart = jasmine.createSpyObj('CartService', ['addToCart', 'removeFromCart']);
    wishlist.getWishListItems.and.returnValue(of([mockProducts[0], mockProducts[1]]));

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

  it('addToCart delegates to CartService', () => {
    component.addToCart(mockProducts[0]);
    expect(cart.addToCart).toHaveBeenCalledOnceWith(mockProducts[0]);
  });

  it('removeFromCart delegates to CartService', () => {
    component.removeFromCart(mockProducts[0]);
    expect(cart.removeFromCart).toHaveBeenCalledOnceWith(mockProducts[0]);
  });
});
