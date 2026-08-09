import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from 'src/app/shared/cart.service';
import { NavigationItem } from 'src/app/shared/navigation-item';
import { WishlistService } from '../../../shared/wishlist.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, FormsModule],
})
export class HeaderComponent {
  readonly items: readonly NavigationItem[] = [
    { label: 'Home', icon: 'pi pi-home', routerLink: ['/home'] },
    { label: 'Products', icon: 'pi pi-list', routerLink: ['/products/search'] },
    { label: 'Categories', icon: 'pi pi-th-large', routerLink: ['/categories'] },
    { label: 'Wishlist', icon: 'pi pi-heart', routerLink: ['/wishlist'] },
    { label: 'Cart', icon: 'pi pi-shopping-cart', routerLink: ['/cart'] },
  ];

  searchQuery = '';
  mobileSearchOpen = false;
  mobileMenuOpen = false;

  @ViewChild('mobileSearchInput') mobileSearchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('mobileSearchToggle') mobileSearchToggle?: ElementRef<HTMLButtonElement>;
  @ViewChild('mobileMenuToggle') mobileMenuToggle?: ElementRef<HTMLButtonElement>;
  @ViewChild('mobileNavigation') mobileNavigation?: ElementRef<HTMLElement>;

  private readonly wishlistCount = computed(
    () => this.wishlistService.wishListItemsSignal().length,
  );
  private readonly cartCount = computed(() => this.cartService.numberOfItemsSignal());

  constructor(
    private readonly wishlistService: WishlistService,
    private readonly cartService: CartService,
    private readonly router: Router,
  ) {}

  get wishListItems(): number {
    return this.wishlistCount();
  }

  get cartItems(): number {
    return this.cartCount();
  }

  onSearch(): void {
    const query = this.searchQuery.trim().slice(0, 100);
    this.mobileSearchOpen = false;
    this.mobileMenuOpen = false;
    void this.router.navigate(['/products/search'], {
      queryParams: query ? { q: query } : {},
    });
  }

  toggleMobileSearch(): void {
    this.mobileSearchOpen = !this.mobileSearchOpen;
    this.mobileMenuOpen = false;
    if (this.mobileSearchOpen) {
      requestAnimationFrame(() => this.mobileSearchInput?.nativeElement.focus());
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.mobileSearchOpen = false;
    if (this.mobileMenuOpen) {
      requestAnimationFrame(() => {
        this.mobileNavigation?.nativeElement.querySelector<HTMLAnchorElement>('a')?.focus();
      });
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeMobileOverlays(): void {
    if (this.mobileMenuOpen) {
      this.mobileMenuOpen = false;
      this.mobileMenuToggle?.nativeElement.focus();
      return;
    }
    if (this.mobileSearchOpen) {
      this.mobileSearchOpen = false;
      this.mobileSearchToggle?.nativeElement.focus();
    }
  }
}
