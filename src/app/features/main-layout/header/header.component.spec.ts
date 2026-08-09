import { ElementRef, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CartService } from 'src/app/shared/cart.service';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { mockProducts } from 'src/app/testing/mock-data';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: { navigate: jest.Mock; events: Subject<unknown>; createUrlTree: jest.Mock; serializeUrl: jest.Mock; isActive: jest.Mock };

  beforeEach(async () => {
    router = {
      navigate: jest.fn(),
      events: new Subject(),
      createUrlTree: jest.fn(() => ({})),
      serializeUrl: jest.fn(() => '/home'),
      isActive: jest.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        {
          provide: WishlistService,
          useValue: { wishListItemsSignal: signal([mockProducts[0]]) },
        },
        {
          provide: CartService,
          useValue: { numberOfItemsSignal: signal(2) },
        },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => jest.restoreAllMocks());

  function runAnimationFramesImmediately(): void {
    jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 1;
    });
  }

  it('exposes numeric wishlist and cart counts', () => {
    expect(component.wishListItems).toBe(1);
    expect(component.cartItems).toBe(2);
    expect(component.items).toHaveLength(5);
  });

  it('searches with a trimmed and bounded query and closes mobile overlays', () => {
    component.searchQuery = `  ${'x'.repeat(120)}  `;
    component.mobileSearchOpen = true;
    component.mobileMenuOpen = true;

    component.onSearch();

    expect(component.mobileSearchOpen).toBe(false);
    expect(component.mobileMenuOpen).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/products/search'], {
      queryParams: { q: 'x'.repeat(100) },
    });
  });

  it('navigates without q for a blank search', () => {
    component.searchQuery = '   ';

    component.onSearch();

    expect(router.navigate).toHaveBeenCalledWith(['/products/search'], { queryParams: {} });
  });

  it('opens, focuses, and closes mobile search while closing the menu', () => {
    runAnimationFramesImmediately();
    const focus = jest.fn();
    component.mobileSearchInput = new ElementRef({ focus } as HTMLInputElement);
    component.mobileMenuOpen = true;

    component.toggleMobileSearch();
    expect(component.mobileSearchOpen).toBe(true);
    expect(component.mobileMenuOpen).toBe(false);
    expect(focus).toHaveBeenCalledTimes(1);

    component.toggleMobileSearch();
    expect(component.mobileSearchOpen).toBe(false);
  });

  it('can open mobile search before its input is rendered', () => {
    runAnimationFramesImmediately();

    expect(() => component.toggleMobileSearch()).not.toThrow();
  });

  it('opens and focuses the first mobile navigation link', () => {
    runAnimationFramesImmediately();
    const focus = jest.fn();
    const querySelector = jest.fn(() => ({ focus }));
    component.mobileNavigation = new ElementRef({ querySelector } as unknown as HTMLElement);
    component.mobileSearchOpen = true;

    component.toggleMobileMenu();

    expect(component.mobileMenuOpen).toBe(true);
    expect(component.mobileSearchOpen).toBe(false);
    expect(querySelector).toHaveBeenCalledWith('a');
    expect(focus).toHaveBeenCalledTimes(1);

    component.toggleMobileMenu();
    expect(component.mobileMenuOpen).toBe(false);
  });

  it('can open mobile navigation before the links are rendered', () => {
    runAnimationFramesImmediately();

    expect(() => component.toggleMobileMenu()).not.toThrow();
  });

  it('closes mobile navigation explicitly', () => {
    component.mobileMenuOpen = true;
    component.closeMobileMenu();
    expect(component.mobileMenuOpen).toBe(false);
  });

  it('closes the menu on Escape and restores its trigger focus', () => {
    const focus = jest.fn();
    component.mobileMenuToggle = new ElementRef({ focus } as HTMLButtonElement);
    component.mobileMenuOpen = true;

    component.closeMobileOverlays();

    expect(component.mobileMenuOpen).toBe(false);
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('closes search on Escape and safely handles missing trigger references', () => {
    component.mobileSearchOpen = true;
    expect(() => component.closeMobileOverlays()).not.toThrow();
    expect(component.mobileSearchOpen).toBe(false);

    component.mobileMenuOpen = true;
    expect(() => component.closeMobileOverlays()).not.toThrow();

    expect(() => component.closeMobileOverlays()).not.toThrow();
  });

  it('restores the search trigger when closing search with Escape', () => {
    const focus = jest.fn();
    component.mobileSearchToggle = new ElementRef({ focus } as HTMLButtonElement);
    component.mobileSearchOpen = true;

    component.closeMobileOverlays();

    expect(focus).toHaveBeenCalledTimes(1);
  });
});
