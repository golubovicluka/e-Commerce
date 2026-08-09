import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { WishlistService } from '../../shared/wishlist.service';
import { Product } from '../products/Product';
import { NavigationItem } from 'src/app/shared/navigation-item';
import { ProductActionsService } from 'src/app/shared/product-actions.service';
import { ProductComponent } from '../products/product/product.component';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from 'src/app/shared/breadcrumb/breadcrumb.component';

@Component({
    selector: 'app-wishlist-view',
    templateUrl: './wishlist-view.component.html',
    styleUrls: ['./wishlist-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BreadcrumbComponent, ProductComponent, RouterLink]
})
export class WishlistViewComponent implements OnInit {

  public items!: NavigationItem[];
  home!: NavigationItem;

  constructor(
    private _wishlistService: WishlistService,
    private readonly productActions: ProductActionsService,
  ) { }

  get wishlistItems(): Product[] {
    return this._wishlistService.wishListItemsSignal();
  }

  ngOnInit(): void {
    this.items = [
      { label: 'Products', routerLink: '/products/search' },
      { label: 'Wishlist', routerLink: '/wishlist' },
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/home' };
  }

  removeFromWishlist(product: Product) {
    this.productActions.toggleWishlist(product);
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }
}
