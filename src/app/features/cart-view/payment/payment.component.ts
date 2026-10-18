import { Component, ChangeDetectionStrategy } from '@angular/core';

import { CartService } from 'src/app/shared/cart.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, RouterLink, DecimalPipe]
})
export class PaymentComponent {

  selectedPaymentMethod: string = 'creditCard';
  readonly total = this._cartService.totalPriceSignal;

  cardNumber: string = '';
  cardHolderName: string = '';
  expiryDate: string = '';
  cvv: string = '';

  constructor(
    private _cartService: CartService,
    private _notificationService: NotificationService,
    private router: Router,
  ) {}

  completePayment(): void {
    // Raw card details (PAN, CVV, expiry) must never be logged or handled in the
    // client. Integrate a PCI-compliant gateway (e.g. Stripe Elements, PayPal SDK)
    // so card data is tokenized by the processor and never touches this code.
    this._notificationService.add({
      severity: 'success',
      summary: 'Order placed',
      detail: 'This is a demo store — no payment was taken.',
    });
    this._cartService.clearCart();
    this.router.navigate(['/home']);
  }

}
