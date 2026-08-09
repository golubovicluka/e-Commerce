import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { Product } from '../../products/Product';

@Component({
  selector: 'app-suggested-product',
  templateUrl: './suggested-product.component.html',
  styleUrls: ['./suggested-product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink],
})
export class SuggestedProductComponent {
  readonly product = input.required<Product>();
  readonly resolvedImage = computed(() => {
    const product = this.product();
    return this.productImageService.resolvePrimaryImage(product.images, product.name);
  });

  constructor(private readonly productImageService: ProductImageService) {}

  onImageError(event: Event): void {
    this.productImageService.handleImageError(event, this.product().name);
  }
}
