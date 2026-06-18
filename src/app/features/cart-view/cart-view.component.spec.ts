import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { CartViewComponent } from './cart-view.component';
import { CartService } from 'src/app/shared/cart.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { of } from 'rxjs';

describe('CartViewComponent', () => {
  let component: CartViewComponent;
  let fixture: ComponentFixture<CartViewComponent>;
  let cart: jasmine.SpyObj<CartService>;
  let router: jasmine.SpyObj<Router>;
  let route: { firstChild: { snapshot: { url: { path: string }[] } } | null };

  beforeEach(async () => {
    cart = jasmine.createSpyObj('CartService', [
      'getCartItems',
      'getCartLines',
      'getTotalPrice',
      'getProductIndex',
      'setQuantityAtIndex',
      'removeFromCart',
    ]);
    cart.getCartItems.and.returnValue(of([]));
    cart.getCartLines.and.returnValue(of([]));
    cart.getTotalPrice.and.returnValue(of(0));
    cart.getProductIndex.and.returnValue(0);
    router = jasmine.createSpyObj('Router', ['navigate'], { events: new Subject() });
    route = { firstChild: null };

    await TestBed.configureTestingModule({
      declarations: [CartViewComponent],
      providers: [
        { provide: CartService, useValue: cart },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        {
          provide: ProductImageService,
          useValue: jasmine.createSpyObj('ProductImageService', ['resolvePrimaryImage', 'handleImageError']),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CartViewComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openShippingView navigates to shipping when checkout is inactive', () => {
    component.checkoutActive = false;
    component.openShippingView();
    expect(router.navigate).toHaveBeenCalledWith(['/cart/shipping']);
  });

  it('openShippingView navigates back to cart when checkout is active', () => {
    component.checkoutActive = true;
    component.openShippingView();
    expect(router.navigate).toHaveBeenCalledWith(['/cart']);
  });

  it('checkoutCtaLabel reflects checkout state', () => {
    component.checkoutActive = false;
    expect(component.checkoutCtaLabel).toBe('Proceed with shipping');
    component.checkoutActive = true;
    expect(component.checkoutCtaLabel).toBe('Back to cart view');
  });
});
