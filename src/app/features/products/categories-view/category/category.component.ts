import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { Category } from '../../Product';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgStyle, RouterLink],
})
export class CategoryComponent {
  readonly category = input.required<Category>();

  constructor(private readonly productImageService: ProductImageService) {}

  getCategoryImage(categoryName: string): string {
    return this.productImageService.getCategoryImage(categoryName);
  }
}
