import { Component, Input, OnInit } from '@angular/core';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  @Input() categories: string[] = [];

  selectedFilters: string[] = [];

  constructor(private _productService: ProductsService) { }

  ngOnInit() {

  }
}
