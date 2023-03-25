import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  @Input() name!: string;
  @Input() description!: string;
  @Input() subCategory!: string;
  @Input() image!: string;
  @Input() id!: number;
  @Input() inStock!: number;
  @Input() price!: number;
  @Input() productId!: number;

  public isAddedToWishList: boolean = false;
  ngOnInit() { }

  // Todo: use event emitter to notify products-view
  addToWishList() {
    this.isAddedToWishList = !this.isAddedToWishList;
    console.log("Added to wishlist");
  }
}
