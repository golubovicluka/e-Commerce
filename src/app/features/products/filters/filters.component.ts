import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  @Input() categories: any[] = [];

  // TODO: event emmiter with selected filters
  selectedFilters: any[] = [];
  @Output() filtersObject = new EventEmitter()

  constructor(private _productService: ProductsService) { }

  ngOnInit() {
  }

  changeFilter(filterObject: any) {
    this.filtersObject.emit(filterObject);
  }

}
