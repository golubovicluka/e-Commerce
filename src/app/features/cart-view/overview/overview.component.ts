import { Component, ChangeDetectionStrategy } from '@angular/core';

import { Observable } from 'rxjs';
import { CartLine, CartService } from 'src/app/shared/cart.service';
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
  cartLines$: Observable<CartLine[]>;
  total$: Observable<number>;
  readonly cartLines = this._cartService.cartLinesSignal;
  readonly total = this._cartService.totalPriceSignal;

  constructor(private _cartService: CartService) {
    this.cartLines$ = this._cartService.getCartLines();
    this.total$ = this._cartService.getTotalPrice();
  }
}
