import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../shared/wishlist.service';
import { Product } from '../products/Product';

@Component({
  selector: 'app-wishlist-view',
  templateUrl: './wishlist-view.component.html',
  styleUrls: ['./wishlist-view.component.scss']
})
export class WishlistViewComponent implements OnInit {
  wishlistItems: Product[] = [];

  constructor(private _wishlistService: WishlistService) { }

  ngOnInit(): void {
    this._wishlistService.getWishListItems().subscribe((data) => {
      console.log('Data: ', data);
      this.wishlistItems = data;
    })
  }

  existsInLocalStorage(id: number) {
    if (localStorage.getItem('wishlist') && JSON.parse(localStorage.getItem('wishlist')!).includes(id)) {
      return true
    } else {
      return false;
    }
  }

  // Remove all wishlist items
  clearLocalStorage(): void {
    localStorage.clear();
  }

}
