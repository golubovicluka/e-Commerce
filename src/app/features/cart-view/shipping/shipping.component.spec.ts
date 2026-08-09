import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CheckoutStateService, ShippingDetails } from '../checkout-state.service';
import { ShippingComponent } from './shipping.component';

describe('ShippingComponent', () => {
  let component: ShippingComponent;
  let fixture: ComponentFixture<ShippingComponent>;
  let router: { navigate: jest.Mock };
  let checkoutState: CheckoutStateService;

  const completeDetails: ShippingDetails = {
    firstName: 'Ana',
    lastName: 'Anić',
    address: 'Knez Mihailova 1',
    apartment: '4',
    postalCode: '11000',
    city: 'Beograd',
    phone: '+381 64 123 4567',
    deliveryNotes: 'Call on arrival',
  };

  beforeEach(async () => {
    router = { navigate: jest.fn(() => Promise.resolve(true)) };

    await TestBed.configureTestingModule({
      imports: [ShippingComponent],
      providers: [
        CheckoutStateService,
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShippingComponent);
    component = fixture.componentInstance;
    checkoutState = TestBed.inject(CheckoutStateService);
  });

  it('starts with an invalid, non-submitted draft', () => {
    expect(component.shippingForm().invalid()).toBe(true);
    expect(checkoutState.shippingReady()).toBe(false);
  });

  it('marks invalid fields and remains on shipping when submission fails', async () => {
    const preventDefault = jest.fn();

    await component.continueToOverview({ preventDefault } as unknown as Event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(component.shippingForm.firstName().touched()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('retains valid details and continues to the overview', async () => {
    checkoutState.shippingDetails.set(completeDetails);
    const preventDefault = jest.fn();

    await component.continueToOverview({ preventDefault } as unknown as Event);

    expect(component.shippingForm().valid()).toBe(true);
    expect(checkoutState.shippingReady()).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith(['/cart/overview']);
  });

  it('validates bounded optional and required fields', () => {
    checkoutState.shippingDetails.set({
      ...completeDetails,
      firstName: 'A'.repeat(61),
      lastName: 'B'.repeat(61),
      address: 'C'.repeat(121),
      apartment: 'D'.repeat(21),
      city: 'E'.repeat(81),
      deliveryNotes: 'F'.repeat(301),
    });

    expect(component.shippingForm().invalid()).toBe(true);
    expect(component.shippingForm.firstName().errors()).not.toHaveLength(0);
    expect(component.shippingForm.lastName().errors()).not.toHaveLength(0);
    expect(component.shippingForm.address().errors()).not.toHaveLength(0);
    expect(component.shippingForm.apartment().errors()).not.toHaveLength(0);
    expect(component.shippingForm.city().errors()).not.toHaveLength(0);
    expect(component.shippingForm.deliveryNotes().errors()).not.toHaveLength(0);
  });
});
