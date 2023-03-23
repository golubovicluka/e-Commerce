import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  @Input() name!: string;
  @Input() description!: string;
  @Input() createdAt!: Date;
  @Input() category!: string;
  @Input() rating!: string;

}
