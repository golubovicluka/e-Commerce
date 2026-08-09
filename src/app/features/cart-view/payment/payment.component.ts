import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { CartService } from 'src/app/shared/cart.service';
import { CheckoutStateService } from '../checkout-state.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, RouterLink, DecimalPipe],
})
export class PaymentComponent {
  readonly total = this.cartService.totalPriceSignal;
  readonly shippingReady = this.checkoutState.shippingReady;
  readonly demoCompleted = this.checkoutState.demoCompleted;
  readonly paymentForm = form(this.checkoutState.paymentSelection, (selection) => {
    required(selection.method, { message: 'Choose a payment preview method.' });
  });

  constructor(
    private readonly cartService: CartService,
    readonly checkoutState: CheckoutStateService,
  ) {}

  async completePayment(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.shippingReady() || this.total() <= 0) return;

    await submit(this.paymentForm, async () => {
      this.checkoutState.demoCompleted.set(true);
    });
  }
}
