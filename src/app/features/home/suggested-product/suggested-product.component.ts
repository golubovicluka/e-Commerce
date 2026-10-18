import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-suggested-product',
    templateUrl: './suggested-product.component.html',
    styleUrls: ['./suggested-product.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DecimalPipe, RouterLink]
})
export class SuggestedProductComponent {
  @Input() name!: string;
  @Input() description!: string;
  @Input() price!: number;
  @Input() inStock!: number;
  @Input() id!: number;
  @Input() image!: string;

  constructor(private _productImageService: ProductImageService) {
  }

  get resolvedImage(): string {
    return this._productImageService.resolvePrimaryImage([this.image], this.name);
  }

  onImageError(event: Event): void {
    this._productImageService.handleImageError(event, this.name);
  }

}
