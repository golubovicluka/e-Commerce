import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';

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
  let cart: jasmine.SpyObj<CartService>;
  let location: jasmine.SpyObj<Location>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const products = jasmine.createSpyObj('ProductsService', [
      'getProductById',
      'getProductsByCategory',
    ]);
    const wishlist = jasmine.createSpyObj('WishlistService', [
      'inWishlist',
      'addWishListItem',
      'removeWishListItem',
    ]);
    cart = jasmine.createSpyObj('CartService', ['addToCart', 'removeFromCart']);
    const images = jasmine.createSpyObj('ProductImageService', [
      'normalizeImages',
      'resolvePrimaryImage',
      'handleImageError',
    ]);
    location = jasmine.createSpyObj('Location', ['back']);
    router = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    router.getCurrentNavigation.and.returnValue(null);

    await TestBed.configureTestingModule({
      declarations: [ProductDetailsComponent],
      providers: [
        { provide: ProductsService, useValue: products },
        { provide: WishlistService, useValue: wishlist },
        { provide: CartService, useValue: cart },
        { provide: ProductImageService, useValue: images },
        { provide: Location, useValue: location },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: 1 } } } },
        MessageService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getInstallmentPayAmount floors price / months', () => {
    expect(component.getInstallmentPayAmount(1200, 12)).toBe(100);
    expect(component.getInstallmentPayAmount(1000, 24)).toBe(41); // 41.6 -> 41
  });

  it('navigateBack uses Location.back', () => {
    component.navigateBack();
    expect(location.back).toHaveBeenCalled();
  });

  it('addToCart / removeFromCart delegate to CartService', () => {
    component.addToCart(mockProducts[0]);
    expect(cart.addToCart).toHaveBeenCalledOnceWith(mockProducts[0]);

    component.removeFromCart(mockProducts[0]);
    expect(cart.removeFromCart).toHaveBeenCalledOnceWith(mockProducts[0]);
  });
});
