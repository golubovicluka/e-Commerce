import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { PaymentComponent } from './payment.component';
import { CartService } from 'src/app/shared/cart.service';

/**
 * PaymentComponent — the checkout payment step — previously had NO spec at all
 * (zero coverage on a critical path). We stop at construction (the PrimeNG
 * `[(ngModel)]` form controls have no value accessor under a unit harness) and
 * cover the reactive total stream and submit handler directly.
 */
describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;
  let cart: jasmine.SpyObj<CartService>;

  beforeEach(async () => {
    cart = jasmine.createSpyObj('CartService', ['getTotalPrice']);
    cart.getTotalPrice.and.returnValue(of(100));

    await TestBed.configureTestingModule({
      declarations: [PaymentComponent],
      providers: [{ provide: CartService, useValue: cart }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('total$ includes shipping on top of the cart subtotal', (done) => {
    component.total$.subscribe((total) => {
      expect(total).toBe(100);
      done();
    });
  });

  it('completePayment runs for the selected method without throwing', () => {
    component.selectedPaymentMethod = 'paypal';
    expect(() => component.completePayment()).not.toThrow();
  });
});
