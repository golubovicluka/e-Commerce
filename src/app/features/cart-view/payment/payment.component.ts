import { Component } from '@angular/core';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {

  selectedPaymentMethod: string = 'creditCard';
  subtotal: number = 100;
  shipping: number = 10;

  get total(): number {
    return this.subtotal + this.shipping;
  }

  cardNumber: string = '';
  cardHolderName: string = '';
  expiryDate: string = '';
  cvv: string = '';

  constructor() { }

  completePayment(): void {
    // Raw card details (PAN, CVV, expiry) must never be logged or handled in the
    // client. Integrate a PCI-compliant gateway (e.g. Stripe Elements, PayPal SDK)
    // so card data is tokenized by the processor and never touches this code.
  }

}
