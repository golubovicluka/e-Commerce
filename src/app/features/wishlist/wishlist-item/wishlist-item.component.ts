import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Subcategory, Category } from '../../products/Product';

@Component({
  selector: 'app-wishlist-item',
  templateUrl: './wishlist-item.component.html',
  styleUrls: ['./wishlist-item.component.scss']
})
export class WishlistItemComponent implements OnInit {
  @Input() name!: string;
  @Input() description!: string;
  @Input() subcategory!: Subcategory | undefined;
  @Input() category!: Category | undefined;
  @Input() categoryId!: number;
  @Input() subcategoryId!: number;
  @Input() images!: string[];
  @Input() EAN!: number;
  @Input() id!: number;
  @Input() inStock!: number;
  @Input() price!: number;
  @Output() addedToWishList = new EventEmitter();
  @Output() removedFromWishList = new EventEmitter();

  ngOnInit(): void { }

}
