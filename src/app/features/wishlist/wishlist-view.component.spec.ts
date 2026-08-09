import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductActionsService } from 'src/app/shared/product-actions.service';
import { WishlistService } from 'src/app/shared/wishlist.service';
import { mockProducts } from 'src/app/testing/mock-data';
import { WishlistViewComponent } from './wishlist-view.component';

describe('WishlistViewComponent', () => {
  let component: WishlistViewComponent;
  let fixture: ComponentFixture<WishlistViewComponent>;
  let actions: { toggleWishlist: jest.Mock };

  beforeEach(async () => {
    actions = { toggleWishlist: jest.fn(() => true) };

    await TestBed.configureTestingModule({
      imports: [WishlistViewComponent],
      providers: [
        {
          provide: WishlistService,
          useValue: { wishListItemsSignal: signal([mockProducts[0], mockProducts[1]]) },
        },
        {
          provide: ProductActionsService,
          useValue: {
            ...actions,
            inCart: jest.fn(() => false),
            inWishlist: jest.fn(() => true),
            toggleCart: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WishlistViewComponent);
    component = fixture.componentInstance;
  });

  it('reads saved products and initializes breadcrumbs', () => {
    component.ngOnInit();

    expect(component.wishlistItems).toEqual([mockProducts[0], mockProducts[1]]);
    expect(component.items.at(-1)?.label).toBe('Wishlist');
    expect(component.home.routerLink).toBe('/home');
  });

  it('removes a product through the shared action facade', () => {
    component.removeFromWishlist(mockProducts[1]);

    expect(actions.toggleWishlist).toHaveBeenCalledWith(mockProducts[1]);
  });

  it('tracks rows by product id', () => {
    expect(component.trackByProductId(0, mockProducts[1])).toBe(mockProducts[1].id);
  });
});
