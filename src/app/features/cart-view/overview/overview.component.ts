import { Component } from '@angular/core';

import { Observable } from 'rxjs';
import { CartLine, CartService } from 'src/app/shared/cart.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent {
  cartLines$: Observable<CartLine[]>;
  total$: Observable<number>;

  constructor(private _cartService: CartService) {
    this.cartLines$ = this._cartService.getCartLines();
    this.total$ = this._cartService.getTotalPrice();
  }
}
