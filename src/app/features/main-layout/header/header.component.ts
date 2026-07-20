import { computed, Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WishlistService } from '../../../shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavigationItem } from 'src/app/shared/navigation-item';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, RouterLinkActive, FormsModule]
})
export class HeaderComponent implements OnInit {
  items: NavigationItem[] = [];
  searchQuery = '';
  mobileSearchOpen = false;
  mobileMenuOpen = false;

  @ViewChild('mobileSearchInput') mobileSearchInput?: ElementRef<HTMLInputElement>;

  private readonly wishlistItemsState = toSignal(
    this._wishlistService.getWishListItems(),
    { initialValue: [] },
  );
  private readonly cartItemsState = toSignal(this._cartService.getCartItems(), {
    initialValue: [],
  });
  private readonly wishlistCount = computed(() => this.wishlistItemsState().length.toString());
  private readonly cartCount = computed(() => this.cartItemsState().length.toString());

  constructor(
    private _wishlistService: WishlistService,
    private _cartService: CartService,
    private router: Router
  ) { }

  get wishListItems(): string {
    return this.wishlistCount();
  }

  get cartItems(): string {
    return this.cartCount();
  }

  ngOnInit() {
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
      requestAnimationFrame(() => this.mobileSearchInput?.nativeElement.focus());
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

}
