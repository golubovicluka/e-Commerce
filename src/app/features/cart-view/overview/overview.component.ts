import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from 'src/app/shared/cart.service';
import { CheckoutStateService } from '../checkout-state.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe],
})
export class OverviewComponent {
  readonly cartLines = this.cartService.cartLinesSignal;
  readonly total = this.cartService.totalPriceSignal;
  readonly shippingDetails = this.checkoutState.shippingDetails;
  readonly shippingReady = this.checkoutState.shippingReady;

  constructor(
    private readonly cartService: CartService,
    private readonly checkoutState: CheckoutStateService,
  ) {}
}
