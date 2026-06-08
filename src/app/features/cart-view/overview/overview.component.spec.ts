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
    cart = jasmine.createSpyObj('CartService', ['getCartItems']);
    cart.getCartItems.and.returnValue(of([mockProducts[0], mockProducts[1]]));

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

  it('exposes the cart items stream from CartService', (done) => {
    component.products$.subscribe((items) => {
      expect(items).toEqual([mockProducts[0], mockProducts[1]]);
      done();
    });
  });
});
