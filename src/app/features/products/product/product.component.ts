import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Product, Subcategory, Category } from '../Product';
import { WishlistService } from 'src/app/shared/wishlist.service';


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
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

  @Input() isListView!: boolean;
  @Input() wishlistView?: boolean;


  @Output() addedToWishList = new EventEmitter();
  @Output() removedFromWishList = new EventEmitter();

  inWishlist!: boolean;
  public product!: Product;

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
    this.inWishlist = this.checkInWishlist(this.id);
  }

  constructor(
    private _messageService: MessageService,
    private router: Router,
    private _wishlistService: WishlistService
  ) {
    this.inWishlist = this.checkInWishlist(this.id);
  }

  addRemoveItemWishlist(product: Product) {
    this.inWishlist = !this.inWishlist;

    if (this.inWishlist) {
      this.addedToWishList.emit(product);
      this._messageService.add({ severity: 'success', summary: 'Added', detail: 'Added to wishlist' })
    } else {
      this.removedFromWishList.emit(product);
      this._messageService.add({ severity: 'info', summary: 'Removed', detail: 'Removed from wishlist' })
    }
  }

  // Check to see if item is in wishlist
  checkInWishlist(id: number) {
    return this._wishlistService.inWishlist(id)
  }

  openProductDetails(id: number) {
    const navigationExtras: NavigationExtras = {
      state: {
        product: this.product
      }
    }
    this.router.navigate(['/products', id], navigationExtras);
  }

  getInstallmentPayAmount(price: number) {
    return Math.floor(price / 12);
  }

}
