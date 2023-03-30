import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../../shared/wishlist.service';
import { Product } from '../../products/Product';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  wishListItems!: string;

  constructor(private _wishlistService: WishlistService) { }

  ngOnInit() {
    this._wishlistService.getWishListItems().subscribe((data: Product[]) => {
      console.log('data from header component: ', data);
      this.wishListItems = data.length.toString();
    })
  }

}
