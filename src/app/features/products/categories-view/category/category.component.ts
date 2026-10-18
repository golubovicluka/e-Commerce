import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle, RouterLink]
})
export class CategoryComponent {
  @Input() name!: string;
  @Input() id!: number;

  constructor(private _productImageService: ProductImageService) { }

  getCategoryImage(categoryName: string): string {
    return this._productImageService.getCategoryImage(categoryName);
  }
}
