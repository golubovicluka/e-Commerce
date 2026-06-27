import { Component } from '@angular/core';

import { Observable } from 'rxjs';
import { MessageService } from 'primeng/api';
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

  constructor(
    private _cartService: CartService,
    private _messageService: MessageService,
  ) {
    this.total$ = this._cartService.getTotalPrice();
  }

  completePayment(): void {
    this._messageService.add({
      severity: 'info',
      summary: 'Payment unavailable',
      detail: 'Checkout uses a demo flow. Integrate a PCI-compliant gateway (e.g. Stripe Elements) before accepting real payments.',
      life: 6000,
    });
  }

}
