import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Product, Subcategory, Category } from '../Product';


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  @Input() name!: string;
  @Input() description!: string;
  @Input() subcategory!: Subcategory;
  @Input() category!: Category;
  @Input() categoryId!: number;
  @Input() subcategoryId!: number;
  @Input() images!: string[];
  @Input() EAN!: number;
  @Input() id!: number;
  @Input() inStock!: number;
  @Input() price!: number;

  @Input() inWishlist!: boolean;
  @Input() isListView!: boolean;


  @Output() addedToWishList = new EventEmitter();
  @Output() removedFromWishList = new EventEmitter();

  public product!: Product;
  public isAddedToWishList: boolean = false;

  ngOnInit() {
    this.product = {
      name: this.name,
      description: this.description,
      category: this.category,
      subcategory: this.subcategory,
      categoryId: this.categoryId,
      subcategoryId: this.subcategoryId,
      images: this.images,
      EAN: this.EAN,
      id: this.id,
      inStock: this.inStock,
      price: this.price
    }
  }

  constructor(
    private _messageService: MessageService,
    private router: Router
  ) { }

  addToWishList(product: Product) {
    this.inWishlist = !this.inWishlist;
    this.isAddedToWishList = !this.isAddedToWishList;

    if (this.isAddedToWishList) {
      this.addedToWishList.emit(product);
      this._messageService.add({ severity: 'success', summary: 'Added', detail: 'Added to wishlist' })
    } else {
      this.removedFromWishList.emit(product);
      this._messageService.add({ severity: 'info', summary: 'Removed', detail: 'Removed from wishlist' })
    }
  }

  openProductDetails(id: number) {
    const navigationExtras: NavigationExtras = {
      state: {
        product: this.product
      }
    }
    console.log('this.product from product', this.product);

    this.router.navigate(['/products', id], navigationExtras);
  }

}
