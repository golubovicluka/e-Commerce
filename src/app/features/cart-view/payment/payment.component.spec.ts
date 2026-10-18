import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';

import { PaymentComponent } from './payment.component';
import { CartService } from 'src/app/shared/cart.service';

describe('PaymentComponent', () => {
    let component: PaymentComponent;
    let fixture: ComponentFixture<PaymentComponent>;
    let cart: any;

    beforeEach(async () => {
        cart = {
            totalPriceSignal: signal(100),
        };

        await TestBed.configureTestingModule({
            imports: [PaymentComponent],
            providers: [{ provide: CartService, useValue: cart }],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(PaymentComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('total reflects the cart subtotal signal', () => {
        expect(component.total()).toBe(100);
    });

    it('completePayment runs for the selected method without throwing', () => {
        component.selectedPaymentMethod = 'paypal';
        expect(() => component.completePayment()).not.toThrow();
    });
});
