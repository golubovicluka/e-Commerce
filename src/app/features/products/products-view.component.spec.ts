import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { ProductsViewComponent } from './products-view.component';
import { ProductsService } from './products.service';
import { WishlistService } from '../../shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { mockProducts, mockCategoriesWithSubcategories } from '../../testing/mock-data';

describe('ProductsViewComponent', () => {
  let component: ProductsViewComponent;
  let fixture: ComponentFixture<ProductsViewComponent>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;

  const productsPageResponse = {
    data: {
      product: mockProducts.slice(0, 2),
      product_aggregate: { aggregate: { count: mockProducts.length } }
    }
  };
  const priceBoundsResponse = {
    data: { product_aggregate: { aggregate: { min: { price: 19.99 }, max: { price: 2499.99 } } } }
  };
  const categoriesResponse = { data: { category: mockCategoriesWithSubcategories } };

  beforeEach(async () => {
    productsServiceSpy = jasmine.createSpyObj('ProductsService', [
      'getProductsPage',
      'getPriceBounds',
      'getProductCategories'
    ]);
    productsServiceSpy.getProductsPage.and.returnValue(of(productsPageResponse) as any);
    productsServiceSpy.getPriceBounds.and.returnValue(of(priceBoundsResponse) as any);
    productsServiceSpy.getProductCategories.and.returnValue(of(categoriesResponse) as any);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    routerSpy.getCurrentNavigation.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ProductsViewComponent],
      providers: [
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: {} },
        {
          provide: WishlistService,
          useValue: jasmine.createSpyObj('WishlistService', ['addWishListItem', 'removeWishListItem'])
        },
        {
          provide: CartService,
          useValue: jasmine.createSpyObj('CartService', ['addToCart', 'removeFromCart'])
        },
        { provide: MessageService, useValue: jasmine.createSpyObj('MessageService', ['add']) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load price-slider bounds from the aggregate', () => {
    expect(productsServiceSpy.getPriceBounds).toHaveBeenCalled();
    expect(component.lowestPrice).toBe(19.99);
    expect(component.highestPrice).toBe(2499.99);
    expect(component.rangeValues).toEqual([19.99, 2499.99]);
  });

  it('should load categories for the filter sidebar', () => {
    expect(productsServiceSpy.getProductCategories).toHaveBeenCalled();
    expect(component.categories).toEqual(mockCategoriesWithSubcategories);
  });

  it('should fetch one page (with total count) on a lazy load request', () => {
    component.loadData({ first: 10, rows: 10 });

    expect(productsServiceSpy.getProductsPage).toHaveBeenCalled();
    const args = productsServiceSpy.getProductsPage.calls.mostRecent().args[0];
    expect(args.offset).toBe(10);
    expect(args.limit).toBe(10);
    expect(component.totalRecords).toBe(mockProducts.length);
    expect(component.products.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should reset to the first page when sorting changes', () => {
    component.loadData({ first: 30, rows: 10 });
    expect(component.first).toBe(30);

    component.onSortChange({ value: 'desc' });

    expect(component.first).toBe(0);
    expect(component.sortKey).toBe('desc');
    const args = productsServiceSpy.getProductsPage.calls.mostRecent().args[0];
    expect(args.orderBy).toEqual([{ price: 'desc' }]);
    expect(args.offset).toBe(0);
  });
});
