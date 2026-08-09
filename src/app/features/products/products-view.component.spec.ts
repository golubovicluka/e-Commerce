import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, ParamMap, Params, Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { ProductActionsService } from 'src/app/shared/product-actions.service';
import {
  mockCategoriesWithSubcategories,
  mockProducts,
} from 'src/app/testing/mock-data';
import { PriceBoundsData, ProductsPageData, ProductsService } from './products.service';
import { ProductsViewComponent } from './products-view.component';

describe('ProductsViewComponent', () => {
  let component: ProductsViewComponent;
  let fixture: ComponentFixture<ProductsViewComponent>;
  let products: {
    getProductsPage: jest.Mock;
    getPriceBounds: jest.Mock;
    getProductCategories: jest.Mock;
  };
  let router: { navigate: jest.Mock };
  let queryParamMap: BehaviorSubject<ParamMap>;

  const pageData: ProductsPageData = {
    product: mockProducts.slice(0, 2),
    product_aggregate: { aggregate: { count: 42 } },
  };
  const boundsData: PriceBoundsData = {
    product_aggregate: {
      aggregate: { min: { price: 10 }, max: { price: 2_500 } },
    },
  };

  beforeEach(async () => {
    products = {
      getProductsPage: jest.fn(() => of({ data: pageData })),
      getPriceBounds: jest.fn(() => of({ data: boundsData })),
      getProductCategories: jest.fn(() =>
        of({ data: { category: mockCategoriesWithSubcategories } }),
      ),
    };
    router = { navigate: jest.fn() };
    queryParamMap = new BehaviorSubject<ParamMap>(convertToParamMap({}));

    await TestBed.configureTestingModule({
      imports: [ProductsViewComponent],
      providers: [
        { provide: ProductsService, useValue: products },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { queryParamMap } },
        {
          provide: ProductActionsService,
          useValue: {
            inCart: jest.fn(() => false),
            inWishlist: jest.fn(() => false),
            toggleCart: jest.fn(),
            toggleWishlist: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsViewComponent);
    component = fixture.componentInstance;
  });

  function emitQuery(params: Params): void {
    queryParamMap.next(convertToParamMap(params));
  }

  function expectNavigation(queryParams: Params, replaceUrl = false): void {
    expect(router.navigate).toHaveBeenLastCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }

  it('loads typed categories, a filtered page, bounds, and URL view state', () => {
    emitQuery({
      q: 'phone',
      categoryId: 1,
      subcategoryId: ['1', '2'],
      sort: 'desc',
      page: '2',
      pageSize: '20',
      minPrice: '100',
      maxPrice: '500',
      layout: 'list',
    });

    component.ngOnInit();

    expect(products.getProductsPage).toHaveBeenCalledWith({
      where: {
        name: { _ilike: '%phone%' },
        category: { id: { _eq: 1 } },
        subcategory: { id: { _in: [1, 2] } },
        price: { _gte: 100, _lte: 500 },
      },
      orderBy: [{ price: 'desc' }],
      limit: 20,
      offset: 20,
    });
    expect(products.getPriceBounds).toHaveBeenCalledWith({
      name: { _ilike: '%phone%' },
      category: { id: { _eq: 1 } },
      subcategory: { id: { _in: [1, 2] } },
    });
    expect(component.products).toEqual(pageData.product);
    expect(component.totalRecords).toBe(42);
    expect(component.categories).toEqual(mockCategoriesWithSubcategories);
    expect(component.rangeValues).toEqual([100, 500]);
    expect(component.currentPage).toBe(2);
    expect(component.totalPages).toBe(3);
    expect(component.selectedCategoryName).toBe('Electronics');
    expect(component.layout).toBe('list');
    expect(component.isLoading).toBe(false);
  });

  it('supports legacy category names and their page heading', () => {
    emitQuery({ category: 'Legacy category' });
    component.ngOnInit();

    expect(component.selectedCategoryName).toBe('Legacy category');
    expect(products.getProductsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { category: { name: { _eq: 'Legacy category' } } },
      }),
    );
  });

  it('returns an empty heading when an id is not in the loaded category list', () => {
    emitQuery({ categoryId: 999 });
    component.ngOnInit();

    expect(component.selectedCategoryName).toBe('');
  });

  it('falls back to zero bounds and an empty category response', () => {
    products.getPriceBounds.mockReturnValue(
      of({
        data: {
          product_aggregate: { aggregate: { min: null, max: null } },
        },
      }),
    );
    products.getProductCategories.mockReturnValue(of({ data: undefined }));

    component.ngOnInit();

    expect(component.categories).toEqual([]);
    expect(component.lowestPrice).toBe(0);
    expect(component.highestPrice).toBe(0);
    expect(component.rangeValues).toEqual([0, 0]);
  });

  it('shows a recoverable page error while tolerating a failed bounds request', () => {
    products.getProductsPage.mockReturnValue(throwError(() => new Error('offline')));
    products.getPriceBounds.mockReturnValue(throwError(() => new Error('offline')));

    component.ngOnInit();

    expect(component.catalogError).toContain('could not load products');
    expect(component.products).toEqual([]);
    expect(component.totalRecords).toBe(0);
    expect(component.isLoading).toBe(false);
  });

  it('treats missing Apollo data as a failed catalog response', () => {
    products.getProductsPage.mockReturnValue(of({ data: undefined }));
    products.getPriceBounds.mockReturnValue(of({ data: undefined }));

    component.ngOnInit();

    expect(component.catalogError).toContain('could not load products');
    expect(component.rangeValues).toEqual([0, 0]);
  });

  it('reports category failures and retries both failed concerns', () => {
    products.getProductCategories.mockReturnValue(throwError(() => new Error('offline')));
    component.ngOnInit();
    products.getProductsPage.mockClear();

    expect(component.filterError).toBe('Categories could not be loaded.');
    expect(component.categories).toEqual([]);

    component.retryCatalogLoad();

    expect(products.getProductCategories).toHaveBeenCalledTimes(2);
    expect(products.getProductsPage).toHaveBeenCalledTimes(1);
  });

  it('retries only the catalog when categories are healthy', () => {
    component.ngOnInit();
    products.getProductCategories.mockClear();
    products.getProductsPage.mockClear();

    component.retryCatalogLoad();

    expect(products.getProductCategories).not.toHaveBeenCalled();
    expect(products.getProductsPage).toHaveBeenCalledTimes(1);
  });

  it('cancels stale catalog requests when the URL changes', () => {
    const pages = [new Subject<{ data: ProductsPageData }>(), new Subject<{ data: ProductsPageData }>()];
    const bounds = [new Subject<{ data: PriceBoundsData }>(), new Subject<{ data: PriceBoundsData }>()];
    products.getProductsPage
      .mockReturnValueOnce(pages[0])
      .mockReturnValueOnce(pages[1]);
    products.getPriceBounds
      .mockReturnValueOnce(bounds[0])
      .mockReturnValueOnce(bounds[1]);

    component.ngOnInit();
    emitQuery({ q: 'new' });
    pages[1].next({ data: { ...pageData, product: [mockProducts[4]] } });
    pages[1].complete();
    bounds[1].next({ data: boundsData });
    bounds[1].complete();
    pages[0].next({ data: { ...pageData, product: [mockProducts[0]] } });
    pages[0].complete();
    bounds[0].next({ data: boundsData });
    bounds[0].complete();

    expect(component.products).toEqual([mockProducts[4]]);
  });

  it('navigates within valid pagination boundaries', () => {
    component.ngOnInit();
    router.navigate.mockClear();

    component.previousPage();
    expect(router.navigate).not.toHaveBeenCalled();

    component.nextPage();
    expectNavigation({ page: 2 });

    emitQuery({ page: 2 });
    component.previousPage();
    expectNavigation({ page: 1 });

    component.totalRecords = 20;
    component.first = 10;
    component.nextPage();
    expect(router.navigate).toHaveBeenCalledTimes(2);
  });

  it('accepts supported page sizes and ignores invalid ones', () => {
    component.ngOnInit();
    router.navigate.mockClear();

    component.onRowsChange(20);
    expectNavigation({ pageSize: 20, page: null });

    component.onRowsChange(25 as never);
    expect(router.navigate).toHaveBeenCalledTimes(1);
  });

  it('debounces, trims, truncates, and deduplicates search navigation', () => {
    jest.useFakeTimers();
    component.ngOnInit();
    router.navigate.mockClear();

    component.onChanges(`  ${'x'.repeat(120)}  `);
    jest.advanceTimersByTime(300);
    expectNavigation({ q: 'x'.repeat(100), page: null }, true);

    component.onChanges(`  ${'x'.repeat(120)}  `);
    jest.advanceTimersByTime(300);
    expect(router.navigate).toHaveBeenCalledTimes(1);

    component.onChanges('   ');
    jest.advanceTimersByTime(300);
    expectNavigation({ q: null, page: null }, true);

    component.onChanges(null as never);
    jest.advanceTimersByTime(300);
    expect(router.navigate).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('writes controlled subcategory, sorting, and layout changes to the URL', () => {
    component.ngOnInit();

    component.applyFilters([1, 2]);
    expectNavigation({ subcategoryId: [1, 2], page: null });
    component.applyFilters([]);
    expectNavigation({ subcategoryId: null, page: null });

    component.onSortChange('desc');
    expectNavigation({ sort: 'desc', page: null });
    component.onSortChange('asc');
    expectNavigation({ sort: null, page: null });
    const calls = router.navigate.mock.calls.length;
    component.onSortChange('invalid' as never);
    expect(router.navigate).toHaveBeenCalledTimes(calls);

    component.setLayout('list');
    expectNavigation({ layout: 'list' }, true);
    component.setLayout('grid');
    expectNavigation({ layout: null }, true);
  });

  it('debounces numeric price inputs and clears full-bound filters', () => {
    jest.useFakeTimers();
    component.ngOnInit();
    router.navigate.mockClear();

    component.onPriceInputChange(0, '250');
    jest.advanceTimersByTime(400);
    expectNavigation({ minPrice: 250, maxPrice: null, page: null });

    component.onPriceInputChange(1, 'invalid');
    jest.advanceTimersByTime(400);
    expectNavigation({ minPrice: 0, maxPrice: 250, page: null });

    component.handlePriceFilter([10, 2_500]);
    expectNavigation({ minPrice: null, maxPrice: null, page: null });
    jest.useRealTimers();
  });

  it('normalizes reversed and negative range-slider values', () => {
    component.ngOnInit();

    component.handlePriceFilter([500, -100]);

    expect(component.rangeValues).toEqual([0, 500]);
    expectNavigation({ minPrice: 0, maxPrice: 500, page: null });

    component.handlePriceFilter([Number.NaN, 0]);
    expect(component.rangeValues).toEqual([0, 0]);
  });

  it('clears all catalog filters while preserving unrelated preferences', () => {
    component.ngOnInit();

    component.clearFilters();

    expect(router.navigate).toHaveBeenLastCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: {
        q: null,
        categoryId: null,
        category: null,
        subcategoryId: null,
        minPrice: null,
        maxPrice: null,
        page: null,
      },
      queryParamsHandling: 'merge',
    });
  });

  it('reports whether any filter is active', () => {
    expect(component.hasActiveFilters).toBe(false);

    const cases: Array<() => void> = [
      () => (component.searchInput = 'phone'),
      () => (component.categoryId = 1),
      () => (component.categoryName = 'Legacy'),
      () => (component.subcategoryFilters = [1]),
      () => (component.priceFrom = 0),
      () => (component.priceTo = 100),
    ];

    for (const activate of cases) {
      component.searchInput = '';
      component.categoryId = null;
      component.categoryName = '';
      component.subcategoryFilters = [];
      component.priceFrom = null;
      component.priceTo = null;
      activate();
      expect(component.hasActiveFilters).toBe(true);
    }
  });
});
