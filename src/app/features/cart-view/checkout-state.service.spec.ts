import { TestBed } from '@angular/core/testing';
import {
  CheckoutStateService,
  createEmptyShippingDetails,
  hasCompleteShippingDetails,
  ShippingDetails,
} from './checkout-state.service';

describe('CheckoutStateService', () => {
  const completeDetails: ShippingDetails = {
    firstName: 'Ana',
    lastName: 'Anić',
    address: 'Knez Mihailova 1',
    apartment: '4',
    postalCode: '11000',
    city: 'Beograd',
    phone: '+381 64 123 4567',
    deliveryNotes: '',
  };

  it('creates a fresh empty shipping draft', () => {
    const first = createEmptyShippingDetails();
    const second = createEmptyShippingDetails();

    expect(first).toEqual({
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      postalCode: '',
      city: '',
      phone: '',
      deliveryNotes: '',
    });
    expect(first).not.toBe(second);
  });

  it('recognizes complete Serbian shipping contact details', () => {
    expect(hasCompleteShippingDetails(completeDetails)).toBe(true);
  });

  it.each([
    ['firstName', 'A'],
    ['lastName', 'B'],
    ['address', 'Road'],
    ['postalCode', '1100'],
    ['city', 'B'],
    ['phone', '123'],
  ] as const)('rejects an invalid %s', (field, value) => {
    expect(hasCompleteShippingDetails({ ...completeDetails, [field]: value })).toBe(false);
  });

  it('derives readiness reactively from the retained draft', () => {
    const service = TestBed.inject(CheckoutStateService);
    expect(service.shippingReady()).toBe(false);
    expect(service.paymentSelection()).toEqual({ method: 'bankTransfer' });
    expect(service.demoCompleted()).toBe(false);

    service.shippingDetails.set(completeDetails);

    expect(service.shippingReady()).toBe(true);
  });
});
