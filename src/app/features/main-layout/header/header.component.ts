import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WishlistService } from '../../../shared/wishlist.service';
import { Product } from '../../products/Product';
import { CartService } from 'src/app/shared/cart.service';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Subject, map, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  wishListItems = '0';
  cartItems = '0';
  items: MenuItem[] = [];
  searchQuery = '';
  mobileSearchOpen = false;
  private destroy$ = new Subject<void>();

  @ViewChild('mobileSearchInput') mobileSearchInput?: ElementRef<HTMLInputElement>;

  constructor(
    private _wishlistService: WishlistService,
    private _cartService: CartService,
    private router: Router
  ) { }

  ngOnInit() {
    this._wishlistService.getWishListItems().pipe(takeUntil(this.destroy$)).subscribe((data: Product[]) => {
      this.wishListItems = data.length.toString();
    });

    this._cartService.getTotalUnits().pipe(takeUntil(this.destroy$)).subscribe((total) => {
      this.cartItems = total.toString();
    });

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(): void {
    const query = this.searchQuery.trim();
    this.mobileSearchOpen = false;
    this.router.navigate(['/products/search'], {
      queryParams: query ? { q: query } : {}
    });
  }

  toggleMobileSearch(): void {
    this.mobileSearchOpen = !this.mobileSearchOpen;
    if (this.mobileSearchOpen) {
      setTimeout(() => this.mobileSearchInput?.nativeElement.focus(), 50);
    }
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

}
