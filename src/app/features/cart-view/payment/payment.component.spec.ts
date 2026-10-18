import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { Router } from '@angular/router';

import { PaymentComponent } from './payment.component';
import { CartService } from 'src/app/shared/cart.service';
import { NotificationService } from 'src/app/shared/notification.service';

describe('PaymentComponent', () => {
    let component: PaymentComponent;
    let fixture: ComponentFixture<PaymentComponent>;
    let cart: any;
    let notifications: any;
    let router: any;

    beforeEach(async () => {
        cart = {
            totalPriceSignal: signal(100),
            clearCart: jest.fn().mockName('CartService.clearCart'),
        };
        notifications = {
            add: jest.fn().mockName('NotificationService.add'),
        };
        router = {
            navigate: jest.fn().mockName('Router.navigate'),
        };

        await TestBed.configureTestingModule({
            imports: [PaymentComponent],
            providers: [
                { provide: CartService, useValue: cart },
                { provide: NotificationService, useValue: notifications },
                { provide: Router, useValue: router },
            ],
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

    it('completePayment shows a success notification, clears the cart, and navigates to /home', () => {
        component.selectedPaymentMethod = 'paypal';
        component.completePayment();

        expect(notifications.add).toHaveBeenCalledWith({
            severity: 'success',
            summary: 'Order placed',
            detail: expect.stringMatching(/demo store.*no payment/i),
        });
        expect(cart.clearCart).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
});
