import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { CartViewComponent } from './cart-view.component';
import { CartService } from 'src/app/shared/cart.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { of } from 'rxjs';

/**
 * The CLI stub threw `NullInjectorError: No provider for MessageService!`. We
 * provide doubles for every dependency. ngOnInit wires several PrimeNG
 * structures and subscriptions, so the smoke test stops at construction; the
 * pure installment helper is covered directly.
 */
describe('CartViewComponent', () => {
  let component: CartViewComponent;
  let fixture: ComponentFixture<CartViewComponent>;
  let cart: jasmine.SpyObj<CartService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    cart = jasmine.createSpyObj('CartService', ['getCartItems', 'getTotalPrice', 'getQuantities', 'setQuantityAtIndex', 'removeFromCart']);
    cart.getCartItems.and.returnValue(of([]));
    cart.getTotalPrice.and.returnValue(of(0));
    cart.getQuantities.and.returnValue([]);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [CartViewComponent],
      providers: [
        { provide: CartService, useValue: cart },
        { provide: Router, useValue: router },
        { provide: ProductImageService, useValue: jasmine.createSpyObj('ProductImageService', ['resolvePrimaryImage', 'handleImageError']) },
        MessageService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CartViewComponent);
    component = fixture.componentInstance;
    // Run ngOnInit so the cart/price subscriptions exist; otherwise the
    // component's ngOnDestroy throws on `undefined.unsubscribe()` during teardown.
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getInstallmentPayAmount floors price / months', () => {
    expect(component.getInstallmentPayAmount(1200, 12)).toBe(100);
    expect(component.getInstallmentPayAmount(1000, 36)).toBe(27); // 27.7 -> 27
  });

  it('openShippingView toggles the label and navigates to the shipping route', () => {
    component.openShippingView();
    expect(component.shippingView).toBeTrue();
    expect(component.shippingViewText).toBe('Back to cart view');
    expect(router.navigate).toHaveBeenCalledWith(['cart/shipping']);

    component.openShippingView();
    expect(component.shippingView).toBeFalse();
    expect(component.shippingViewText).toBe('Proceed with shipping');
  });
});
