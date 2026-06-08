import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ShippingComponent } from './shipping.component';

/**
 * The CLI stub failed at `detectChanges()`: the template uses `[(ngModel)]`
 * (needs FormsModule) and PrimeNG elements (`p-divider`, `p-checkbox`). With
 * FormsModule imported and NO_ERRORS_SCHEMA suppressing the PrimeNG tags, the
 * presentational form renders cleanly.
 */
describe('ShippingComponent', () => {
  let component: ShippingComponent;
  let fixture: ComponentFixture<ShippingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ShippingComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ShippingComponent);
    component = fixture.componentInstance;
  });

  it('should create and render the shipping form', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
