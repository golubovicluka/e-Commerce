import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  imports: [BreadcrumbComponent, ProductComponent, RouterLink],
})
export class WishlistViewComponent {
  readonly items: NavigationItem[] = [
    { label: 'Products', routerLink: '/products/search' },
    { label: 'Wishlist', routerLink: '/wishlist' },
  ];
  readonly home: NavigationItem = { icon: 'pi pi-home', routerLink: '/home' };

  constructor(
    private readonly wishlistService: WishlistService,
    private readonly productActions: ProductActionsService,
  ) {}

  get wishlistItems(): Product[] {
    return this.wishlistService.wishListItemsSignal();
  }

  removeFromWishlist(product: Product): void {
    this.productActions.toggleWishlist(product);
  }
}
