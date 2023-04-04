import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../../shared/wishlist.service';
import { Product } from '../../products/Product';
import { CartService } from 'src/app/shared/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  wishListItems!: string;
  cartItems: string = "0";

  constructor(
    private _wishlistService: WishlistService,
    private _cartService: CartService
  ) { }

  ngOnInit() {
    this._wishlistService.getWishListItems().subscribe((data: Product[]) => {
      console.log('data from header component: ', data);
      this.wishListItems = data.length.toString();
    });

    this._cartService.getCartItems().subscribe((data: Product[]) => {
      console.log('cart items: ', data);
      this.cartItems = data.length.toString();
    })

  }

}
