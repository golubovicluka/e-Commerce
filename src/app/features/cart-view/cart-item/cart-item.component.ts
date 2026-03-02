import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Product} from "../../products/Product";
import { ProductImageService } from 'src/app/shared/product-image.service';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss']
})
export class CartItemComponent {
  @Input() product!: Product;
  @Output() removeFromCart = new EventEmitter<Product>();
  @Output() openProductDetails = new EventEmitter<number>();
  @Output() updateCartTotal = new EventEmitter<number>();

  pieces: number = 1;

  constructor(private _productImageService: ProductImageService) {
  }

  decrementProductCount() {
    if (this.pieces > 1) {
      this.pieces--;
      this.updateCartTotal.emit(-this.product.price);
    }
  }

  incrementProductCount(maxStock: number) {
    if (this.pieces < maxStock) {
      this.pieces++;
      this.updateCartTotal.emit(this.product.price);
    }
  }

  removeItem(product: Product) {
    this.removeFromCart.emit(product);
    this.updateCartTotal.emit(-this.product.price * this.pieces);
  }

  openDetails(id: number) {
    this.openProductDetails.emit(id);
  }

  getProductImage(product: Product): string {
    return this._productImageService.resolvePrimaryImage(product.images, product.name);
  }

  onProductImageError(event: Event, productName: string): void {
    this._productImageService.handleImageError(event, productName);
  }
}
