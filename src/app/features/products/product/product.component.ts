import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductActionsService } from 'src/app/shared/product-actions.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { getInstallmentAmount } from 'src/app/shared/pricing';
import { Product } from '../Product';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink],
})
export class ProductComponent {
  readonly product = input.required<Product>();
  readonly isListView = input(false, { transform: booleanAttribute });
  readonly wishlistView = input(false, { transform: booleanAttribute });

  readonly viewProduct = computed<Product>(() => {
    const product = this.product();
    return {
      ...product,
      images: this.productImages.normalizeImages(product.images, product.name),
    };
  });
  readonly inWishlist = computed(() => this.productActions.inWishlist(this.product().id));
  readonly inCart = computed(() => this.productActions.inCart(this.product().id));
  readonly primaryImageSrc = computed(() => {
    const product = this.viewProduct();
    return this.productImages.resolvePrimaryImage(product.images, product.name);
  });

  readonly getInstallmentAmount = getInstallmentAmount;

  constructor(
    private readonly productActions: ProductActionsService,
    private readonly productImages: ProductImageService,
  ) {}

  toggleWishlist(): void {
    this.productActions.toggleWishlist(this.viewProduct());
  }

  toggleCart(): void {
    this.productActions.toggleCart(this.viewProduct());
  }

  onImageError(event: Event): void {
    this.productImages.handleImageError(event, this.product().name);
  }
}
