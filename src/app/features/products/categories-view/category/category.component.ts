import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle]
})
export class CategoryComponent {
  @Input() name!: string;
  @Input() id!: number;

  @Output() applyCategoryFilter = new EventEmitter();

  constructor(private _productImageService: ProductImageService) { }

  openProductsPage(categoryName: string) {
    this.applyCategoryFilter.emit(categoryName);
  }

  getCategoryImage(categoryName: string): string {
    return this._productImageService.getCategoryImage(categoryName);
  }
}
