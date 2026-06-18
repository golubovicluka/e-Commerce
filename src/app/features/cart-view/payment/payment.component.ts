import { Component } from '@angular/core';

import { Observable } from 'rxjs';
import { CartService } from 'src/app/shared/cart.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {

  selectedPaymentMethod: string = 'creditCard';
  total$: Observable<number>;

  cardNumber: string = '';
  cardHolderName: string = '';
  expiryDate: string = '';
  cvv: string = '';

  constructor(private _cartService: CartService) {
    this.total$ = this._cartService.getTotalPrice();
  }

  completePayment(): void {
    // Raw card details (PAN, CVV, expiry) must never be logged or handled in the
    // client. Integrate a PCI-compliant gateway (e.g. Stripe Elements, PayPal SDK)
    // so card data is tokenized by the processor and never touches this code.
  }

}
