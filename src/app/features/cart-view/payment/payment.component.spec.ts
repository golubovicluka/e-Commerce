import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PaymentComponent } from './payment.component';

/**
 * PaymentComponent — the checkout payment step — previously had NO spec at all
 * (zero coverage on a critical path). It has no injected dependencies. We stop
 * at construction (the PrimeNG `[(ngModel)]` form controls have no value
 * accessor under a unit harness) and cover the `total` getter and submit handler
 * directly.
 */
describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('total sums subtotal and shipping', () => {
    component.subtotal = 100;
    component.shipping = 10;
    expect(component.total).toBe(110);

    component.subtotal = 250;
    component.shipping = 0;
    expect(component.total).toBe(250);
  });

  it('completePayment runs for the selected method without throwing', () => {
    component.selectedPaymentMethod = 'paypal';
    expect(() => component.completePayment()).not.toThrow();
  });
});
