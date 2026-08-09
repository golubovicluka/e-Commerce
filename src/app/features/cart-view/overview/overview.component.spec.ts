import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartService } from 'src/app/shared/cart.service';
import { mockProducts } from 'src/app/testing/mock-data';
import { CheckoutStateService, ShippingDetails } from '../checkout-state.service';
import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  const lines = signal([
    { product: mockProducts[0], quantity: 2, lineTotal: mockProducts[0].price * 2 },
  ]);
  const total = signal(mockProducts[0].price * 2);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [
        provideRouter([]),
        CheckoutStateService,
        {
          provide: CartService,
          useValue: { cartLinesSignal: lines, totalPriceSignal: total },
        },
      ],
    }).compileComponents();
  });

  it('exposes cart and shipping signals as a single review model', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    const component = fixture.componentInstance;

    expect(component.cartLines()).toEqual(lines());
    expect(component.total()).toBe(total());
    expect(component.shippingReady()).toBe(false);
  });

  it('reflects retained shipping details', () => {
    const details: ShippingDetails = {
      firstName: 'Ana',
      lastName: 'Anić',
      address: 'Knez Mihailova 1',
      apartment: '',
      postalCode: '11000',
      city: 'Beograd',
      phone: '+381 64 123 4567',
      deliveryNotes: '',
    };
    TestBed.inject(CheckoutStateService).shippingDetails.set(details);
    const component = TestBed.createComponent(OverviewComponent).componentInstance;

    expect(component.shippingDetails()).toEqual(details);
    expect(component.shippingReady()).toBe(true);
  });
});
