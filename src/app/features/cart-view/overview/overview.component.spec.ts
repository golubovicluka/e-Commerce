import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { OverviewComponent } from './overview.component';
import { CartService } from 'src/app/shared/cart.service';
import { mockProducts } from 'src/app/testing/mock-data';

/**
 * The CLI stub failed at `detectChanges()` (NG0304: `p-divider` unknown).
 * OverviewComponent only reads the cart stream, so we provide a CartService
 * double and assert it exposes those items.
 */
describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let cart: jasmine.SpyObj<CartService>;

  beforeEach(async () => {
    cart = jasmine.createSpyObj('CartService', ['getCartItems', 'getCartLines', 'getTotalPrice']);
    cart.getCartItems.and.returnValue(of([mockProducts[0], mockProducts[1]]));
    cart.getCartLines.and.returnValue(of([
      { product: mockProducts[0], quantity: 1, lineTotal: mockProducts[0].price },
      { product: mockProducts[1], quantity: 1, lineTotal: mockProducts[1].price },
    ]));
    cart.getTotalPrice.and.returnValue(of(mockProducts[0].price + mockProducts[1].price));

    await TestBed.configureTestingModule({
      declarations: [OverviewComponent],
      providers: [{ provide: CartService, useValue: cart }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes the cart lines stream from CartService', (done) => {
    component.cartLines$.subscribe((lines) => {
      expect(lines.length).toBe(2);
      expect(lines[0].product).toEqual(mockProducts[0]);
      done();
    });
  });
});
