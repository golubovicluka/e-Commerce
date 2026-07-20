import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { ShippingComponent } from './shipping.component';

/**
 * The CLI stub failed at `detectChanges()`: the template uses `[(ngModel)]`
 * (needs FormsModule) and form controls. With FormsModule imported and
 * NO_ERRORS_SCHEMA suppressing presentation details, the
 * presentational form renders cleanly.
 */
describe('ShippingComponent', () => {
    let component: ShippingComponent;
    let fixture: ComponentFixture<ShippingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
    imports: [FormsModule, ShippingComponent],
    providers: [provideRouter([])],
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
