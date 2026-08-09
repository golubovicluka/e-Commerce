import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartService } from 'src/app/shared/cart.service';
import { CheckoutStateService, ShippingDetails } from '../checkout-state.service';
import { PaymentComponent } from './payment.component';

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;
  let checkoutState: CheckoutStateService;
  const total = signal(100);
  const completeDetails: ShippingDetails = {
    firstName: 'Ana',
    lastName: 'Anić',
    address: 'Knez Mihailova 1',
    apartment: '',
    postalCode: '11000',
    city: 'Beograd',
    phone: '+381 64 123 4567',
    deliveryNotes: '',
  };

  beforeEach(async () => {
    total.set(100);
    await TestBed.configureTestingModule({
      imports: [PaymentComponent],
      providers: [
        provideRouter([]),
        CheckoutStateService,
        { provide: CartService, useValue: { totalPriceSignal: total } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    checkoutState = TestBed.inject(CheckoutStateService);
  });

  it('defaults to a non-sensitive bank-transfer preview', () => {
    expect(component.paymentForm.method().value()).toBe('bankTransfer');
    expect(component.total()).toBe(100);
    expect(component.demoCompleted()).toBe(false);
  });

  it('does not complete without valid shipping details', async () => {
    const preventDefault = jest.fn();

    await component.completePayment({ preventDefault } as unknown as Event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(component.demoCompleted()).toBe(false);
  });

  it('does not complete an empty cart', async () => {
    checkoutState.shippingDetails.set(completeDetails);
    total.set(0);

    await component.completePayment({ preventDefault: jest.fn() } as unknown as Event);

    expect(component.demoCompleted()).toBe(false);
  });

  it('completes only the local demo state for a valid checkout', async () => {
    checkoutState.shippingDetails.set(completeDetails);
    checkoutState.paymentSelection.set({ method: 'paypalHandoff' });

    await component.completePayment({ preventDefault: jest.fn() } as unknown as Event);

    expect(component.paymentForm.method().value()).toBe('paypalHandoff');
    expect(component.demoCompleted()).toBe(true);
  });
});
