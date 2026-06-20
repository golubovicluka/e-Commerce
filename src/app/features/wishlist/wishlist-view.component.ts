import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../shared/wishlist.service';
import { Product } from '../products/Product';
import { MenuItem, MessageService } from 'primeng/api';
import { CartService } from 'src/app/shared/cart.service';

@Component({
  selector: 'app-wishlist-view',
  templateUrl: './wishlist-view.component.html',
  styleUrls: ['./wishlist-view.component.scss']
})
export class WishlistViewComponent implements OnInit, OnDestroy {
  wishlistItems: Product[] = [];

  public items!: MenuItem[];
  home!: MenuItem;

  private wishlistSubscription!: Subscription;

  constructor(
    private _wishlistService: WishlistService,
    private _messageService: MessageService,
    private _cartService: CartService
  ) { }

  ngOnInit(): void {
    this.wishlistSubscription = this._wishlistService.getWishListItems().subscribe((data) => {
      this.wishlistItems = data;
    });

    this.items = [
      { label: 'Products', routerLink: '/products/search' },
      { label: 'Wishlist', routerLink: '/wishlist' },
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/home' };
  }

  ngOnDestroy(): void {
    this.wishlistSubscription?.unsubscribe();
  }

  isInWishlist(id: number): boolean {
    return this._wishlistService.inWishlist(id);
  }

  addToCart(product: Product) {
    this._cartService.addToCart(product);
  }

  removeFromCart(product: Product) {
    this._cartService.removeFromCart(product);
  }

  removeFromWishlist(product: Product) {
    this._messageService.add({ severity: 'info', summary: 'Removed', detail: 'Removed from wishlist' });
    this._wishlistService.removeWishListItem(product);
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }
}
