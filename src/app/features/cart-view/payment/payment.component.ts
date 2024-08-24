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
    console.log('Payment completed using:', this.selectedPaymentMethod);
    console.log('Card Number:', this.cardNumber);
    console.log('Card Holder Name:', this.cardHolderName);
    console.log('Expiry Date:', this.expiryDate);
    console.log('CVV:', this.cvv);

  }

}
