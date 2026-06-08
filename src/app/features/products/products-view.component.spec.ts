import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { ProductsViewComponent } from './products-view.component';
import { ProductsService } from './products.service';
import { WishlistService } from '../../shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { mockProducts } from 'src/app/testing/mock-data';

/**
 * The CLI stub threw `No provider for Apollo!` via ProductsService. This is the
 * most logic-heavy component in the app; ngOnInit fires multiple queries and a
 * large PrimeNG template, so the smoke test stops at construction (the
 * constructor reads `router.getCurrentNavigation()`, hence the Router spy).
 * Dependency-light behaviour — the trackBy and the wishlist/cart handoffs — is
 * covered directly.
 */
describe('ProductsViewComponent', () => {
  let component: ProductsViewComponent;
  let fixture: ComponentFixture<ProductsViewComponent>;
  let wishlist: jasmine.SpyObj<WishlistService>;
  let cart: jasmine.SpyObj<CartService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const products = jasmine.createSpyObj('ProductsService', [
      'getProducts',
      'getProductCategories',
      'searchProducts',
      'getFilteredProducts',
      'getProductsByPrice',
    ]);
    wishlist = jasmine.createSpyObj('WishlistService', ['addWishListItem', 'removeWishListItem']);
    cart = jasmine.createSpyObj('CartService', ['addToCart', 'removeFromCart']);
    router = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    router.getCurrentNavigation.and.returnValue(null);

    await TestBed.configureTestingModule({
      declarations: [ProductsViewComponent],
      providers: [
        { provide: ProductsService, useValue: products },
        { provide: WishlistService, useValue: wishlist },
        { provide: CartService, useValue: cart },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        MessageService,
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
    expect(wishlist.addWishListItem).toHaveBeenCalledOnceWith(mockProducts[0]);

    component.removedFromWishList(mockProducts[0]);
    expect(wishlist.removeWishListItem).toHaveBeenCalledOnceWith(mockProducts[0]);
  });

  it('addToCart / removeFromCart delegate to CartService', () => {
    component.addToCart(mockProducts[1]);
    expect(cart.addToCart).toHaveBeenCalledOnceWith(mockProducts[1]);

    component.removeFromCart(mockProducts[1]);
    expect(cart.removeFromCart).toHaveBeenCalledOnceWith(mockProducts[1]);
  });

  it('openProductDetails navigates to the product route', () => {
    component.openProductDetails(9);
    expect(router.navigate).toHaveBeenCalledWith(['/product', 9]);
  });
});
