import { Component, OnInit, ViewChild } from '@angular/core';
import { WishlistService } from '../../shared/wishlist.service';
import { Product } from '../products/Product';
import { MenuItem, MessageService } from 'primeng/api';
import { ProductComponent } from '../products/product/product.component';
import { CartService } from 'src/app/shared/cart.service';

@Component({
  selector: 'app-wishlist-view',
  templateUrl: './wishlist-view.component.html',
  styleUrls: ['./wishlist-view.component.scss']
})
export class WishlistViewComponent implements OnInit {
  wishlistItems: Product[] = [];

  public items!: MenuItem[];
  home!: MenuItem;

  @ViewChild('productComponent') productComponent!: ProductComponent;


  constructor(
    private _wishlistService: WishlistService,
    private _messageService: MessageService,
    private _cartService: CartService
  ) { }

  ngOnInit(): void {
    this._wishlistService.getWishListItems().subscribe((data) => {
      this.wishlistItems = data;
    })

    this.items = [
      { label: 'Products', routerLink: '/products/search' },
      { label: 'Wishlist', routerLink: '/wishlist' },
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/home' };
  }

  existsInLocalStorage(id: number) {
    if (localStorage.getItem('wishlist') && JSON.parse(localStorage.getItem('wishlist')!).includes(id)) {
      return true
    } else {
      return false;
    }
  }

  addToCart(product: Product) {
    this._cartService.addToCart(product);
  }

  removeFromCart(product: Product) {
    this._cartService.removeFromCart(product);
  }

  removeFromWishlist(product: Product) {

    const removeProduct = this.productComponent.product;
    this._messageService.add({ severity: 'info', summary: 'Removed', detail: 'Removed from wishlist' })
    this._wishlistService.removeWishListItem(removeProduct);
  }

  clearLocalStorage(): void {
    localStorage.clear();
  }

}
