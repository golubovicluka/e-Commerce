import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../../shared/wishlist.service';
import { Product } from '../../products/Product';
import { CartService } from 'src/app/shared/cart.service';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  wishListItems!: string;
  cartItems: string = "0";
  items: MenuItem[] = [];

  constructor(
    private _wishlistService: WishlistService,
    private _cartService: CartService,
    private router: Router
  ) { }

  ngOnInit() {
    this._wishlistService.getWishListItems().subscribe((data: Product[]) => {
      this.wishListItems = data.length.toString();
    });

    this._cartService.getCartItems().subscribe((data: Product[]) => {
      this.cartItems = data.length.toString();
    })

    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: ['/home']
      },
      {
        label: 'Products',
        icon: 'pi pi-list',
        routerLink: ['/products/search']
      },
      {
        label: 'Categories',
        icon: 'pi pi-th-large',
        routerLink: ['/categories']
      },
      {
        label: 'Wishlist',
        icon: 'pi pi-heart',
        routerLink: ['/wishlist']
      },
      {
        label: 'Cart',
        icon: 'pi pi-shopping-cart',
        routerLink: ['/cart']
      }
    ];
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

}