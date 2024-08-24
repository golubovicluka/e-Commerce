import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-suggested-product',
  templateUrl: './suggested-product.component.html',
  styleUrls: ['./suggested-product.component.scss']
})
export class SuggestedProductComponent {
  Math = Math;

  @Input() name!: string;
  @Input() description!: string;
  @Input() price!: number;
  @Input() inStock!: number;
  @Input() id!: number;
  @Input() image!: string;
  @Output() openProductDetails = new EventEmitter();


  openDetails(id: number) {
    this.openProductDetails.emit(id);
  }

}