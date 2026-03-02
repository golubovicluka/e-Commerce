import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductImageService } from 'src/app/shared/product-image.service';

@Component({
  selector: 'app-suggested-product',
  templateUrl: './suggested-product.component.html',
  styleUrls: ['./suggested-product.component.scss']
})
export class SuggestedProductComponent {
  Math = Math;

  @Input() name!: string;
  @Input() description!: string;
  @Input() price!: number;
  @Input() inStock!: number;
  @Input() id!: number;
  @Input() image!: string;
  @Output() openProductDetails = new EventEmitter();

  constructor(private _productImageService: ProductImageService) {
  }

  openDetails(id: number) {
    this.openProductDetails.emit(id);
  }

  get resolvedImage(): string {
    return this._productImageService.resolvePrimaryImage([this.image], this.name);
  }

  onImageError(event: Event): void {
    this._productImageService.handleImageError(event, this.name);
  }

}
