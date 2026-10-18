import { Component, ChangeDetectionStrategy } from '@angular/core';

import { CartService } from 'src/app/shared/cart.service';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, DecimalPipe]
})
export class OverviewComponent {
  readonly cartLines = this._cartService.cartLinesSignal;
  readonly total = this._cartService.totalPriceSignal;

  constructor(private _cartService: CartService) {}
}
