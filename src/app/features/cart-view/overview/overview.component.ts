import { Component } from '@angular/core';

import { Observable } from 'rxjs';
import { CartService } from 'src/app/shared/cart.service';

import { Product } from '../../products/Product';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent {
  products$: Observable<Product[]>;

  constructor(private _cartService: CartService) {
    this.products$ = this._cartService.getCartItems();
  }
}
