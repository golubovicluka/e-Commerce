import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProductImageService } from 'src/app/shared/product-image.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  @Input() name!: string;
  @Input() id!: number;

  @Output() applyCategoryFilter = new EventEmitter();

  constructor(private _productImageService: ProductImageService) { }

  ngOnInit(): void { }

  openProductsPage(categoryName: string) {
    this.applyCategoryFilter.emit(categoryName);
  }

  getCategoryImage(categoryName: string): string {
    return this._productImageService.getCategoryImage(categoryName);
  }
}
