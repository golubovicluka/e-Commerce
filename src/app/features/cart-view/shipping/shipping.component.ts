import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  form,
  FormField,
  maxLength,
  minLength,
  pattern,
  required,
  submit,
} from '@angular/forms/signals';
import { Router } from '@angular/router';
import {
  CheckoutStateService,
  PHONE_PATTERN,
  POSTAL_CODE_PATTERN,
} from '../checkout-state.service';

@Component({
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
})
export class ShippingComponent {
  readonly shippingForm = form(this.checkoutState.shippingDetails, (details) => {
    required(details.firstName, { message: 'Enter your first name.' });
    minLength(details.firstName, 2, { message: 'Use at least 2 characters.' });
    maxLength(details.firstName, 60, { message: 'Use no more than 60 characters.' });

    required(details.lastName, { message: 'Enter your last name.' });
    minLength(details.lastName, 2, { message: 'Use at least 2 characters.' });
    maxLength(details.lastName, 60, { message: 'Use no more than 60 characters.' });

    required(details.address, { message: 'Enter a street address.' });
    minLength(details.address, 5, { message: 'Use at least 5 characters.' });
    maxLength(details.address, 120, { message: 'Use no more than 120 characters.' });
    maxLength(details.apartment, 20, { message: 'Use no more than 20 characters.' });

    required(details.postalCode, { message: 'Enter a postal code.' });
    pattern(details.postalCode, POSTAL_CODE_PATTERN, {
      message: 'Use a 5-digit Serbian postal code.',
    });

    required(details.city, { message: 'Enter a city.' });
    minLength(details.city, 2, { message: 'Use at least 2 characters.' });
    maxLength(details.city, 80, { message: 'Use no more than 80 characters.' });

    required(details.phone, { message: 'Enter a phone number.' });
    pattern(details.phone, PHONE_PATTERN, { message: 'Enter a valid phone number.' });
    maxLength(details.deliveryNotes, 300, {
      message: 'Use no more than 300 characters.',
    });
  });

  constructor(
    readonly checkoutState: CheckoutStateService,
    private readonly router: Router,
  ) {}

  async continueToOverview(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.shippingForm, async () => {
      await this.router.navigate(['/cart/overview']);
    });
  }
}
