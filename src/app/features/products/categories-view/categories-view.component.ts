import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-categories-view',
  templateUrl: './categories-view.component.html',
  styleUrls: ['./categories-view.component.scss']
})
export class CategoriesViewComponent implements OnInit {
  categories: any[] = [];

  constructor(private _productsService: ProductsService) { }

  ngOnInit(): void {
    this._productsService.getProductCategories().subscribe((categories: any) => {
      console.log(categories.data.category);
      this.categories = categories.data.category;
    })
  }

}
