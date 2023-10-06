import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Product} from "../../products/Product";

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss']
})
export class CartItemComponent {
  @Input() product!: Product;
  @Output() removeFromCart = new EventEmitter();
  @Output() openProductDetails = new EventEmitter();

  pieces: number = 1;

  decrementProductCount() {
    this.pieces = Math.max(this.pieces - 1, 1);
  }

  incrementProductCount(maxStock: number) {
    this.pieces = Math.min(this.pieces + 1, maxStock);
  }

  removeItem(product: Product) {
    this.removeFromCart.emit(product);
  }

  openDetails(id: number) {
    this.openProductDetails.emit(id);
  }

}
