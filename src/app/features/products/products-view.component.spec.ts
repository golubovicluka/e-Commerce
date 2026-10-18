import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import { ProductsViewComponent } from './products-view.component';
import { ProductsService } from './products.service';
import { WishlistService } from '../../shared/wishlist.service';
import { CartService } from 'src/app/shared/cart.service';
import { mockProducts } from 'src/app/testing/mock-data';

/**
 * The CLI stub threw `No provider for Apollo!` via ProductsService. This is the
 * most logic-heavy component in the app; ngOnInit fires multiple queries and a
 * large catalog template, so the smoke test stops at construction (the
 * constructor reads `router.getCurrentNavigation()`, hence the Router spy).
 * Dependency-light behaviour — the trackBy and the wishlist/cart handoffs — is
 * covered directly.
 */
describe('ProductsViewComponent', () => {
    let component: ProductsViewComponent;
    let fixture: ComponentFixture<ProductsViewComponent>;
    let wishlist: any;
    let cart: any;
    let router: any;
    let products: any;
    let queryParams: BehaviorSubject<Record<string, string>>;

    beforeEach(async () => {
        products = {
            getProductCategories: jest.fn().mockName("ProductsService.getProductCategories"),
            getProductsPage: jest.fn().mockName("ProductsService.getProductsPage"),
            getPriceBounds: jest.fn().mockName("ProductsService.getPriceBounds"),
            categoryFilter: new Subject<string>(),
        };
        products.getProductsPage.mockReturnValue(of({
            data: { product: [], product_aggregate: { aggregate: { count: 0 } } },
        }));
        products.getPriceBounds.mockReturnValue(of({
            data: { product_aggregate: { aggregate: { min: { price: 0 }, max: { price: 0 } } } },
        }));
        products.getProductCategories.mockReturnValue(of({ data: { category: [] } }));
        queryParams = new BehaviorSubject<Record<string, string>>({ q: 'phone' });
        wishlist = {
            addWishListItem: jest.fn().mockName("WishlistService.addWishListItem"),
            removeWishListItem: jest.fn().mockName("WishlistService.removeWishListItem")
        };
        cart = {
            addToCart: jest.fn().mockName("CartService.addToCart"),
            removeFromCart: jest.fn().mockName("CartService.removeFromCart")
        };
        router = {
            navigate: jest.fn().mockName("Router.navigate"),
            getCurrentNavigation: jest.fn().mockName("Router.getCurrentNavigation")
        };
        router.getCurrentNavigation.mockReturnValue(null);

        await TestBed.configureTestingModule({
    imports: [ProductsViewComponent],
    providers: [
        { provide: ProductsService, useValue: products },
        { provide: WishlistService, useValue: wishlist },
        { provide: CartService, useValue: cart },
        { provide: Router, useValue: router },
        {
            provide: ActivatedRoute,
            useValue: { snapshot: { params: {} }, queryParams },
        },
    ],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();

        fixture = TestBed.createComponent(ProductsViewComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        window.history.replaceState({}, '', '/');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('trackByProductId returns the product id', () => {
        expect(component.trackByProductId(0, mockProducts[2])).toBe(mockProducts[2].id);
    });

    it('addToWishList / removedFromWishList delegate to WishlistService', () => {
        component.addToWishList(mockProducts[0]);
        expect(wishlist.addWishListItem).toHaveBeenCalledTimes(1);
        expect(wishlist.addWishListItem).toHaveBeenCalledWith(mockProducts[0]);

        component.removedFromWishList(mockProducts[0]);
        expect(wishlist.removeWishListItem).toHaveBeenCalledTimes(1);
        expect(wishlist.removeWishListItem).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('addToCart / removeFromCart delegate to CartService', () => {
        component.addToCart(mockProducts[1]);
        expect(cart.addToCart).toHaveBeenCalledTimes(1);
        expect(cart.addToCart).toHaveBeenCalledWith(mockProducts[1]);

        component.removeFromCart(mockProducts[1]);
        expect(cart.removeFromCart).toHaveBeenCalledTimes(1);
        expect(cart.removeFromCart).toHaveBeenCalledWith(mockProducts[1]);
    });

    it('openProductDetails navigates to the product route', () => {
        component.openProductDetails(9);
        expect(router.navigate).toHaveBeenCalledWith(['/product', 9]);
    });

    it('loads a query-param search exactly once during initialization', () => {
        component.ngOnInit();

        expect(products.getProductsPage).toHaveBeenCalledTimes(1);
        expect(products.getProductsPage).toHaveBeenLastCalledWith(
            expect.objectContaining({ where: { name: { _ilike: '%phone%' } } }),
        );
    });

    it('loads page results, price bounds, categories, and view metadata', () => {
        products.getProductsPage.mockReturnValue(of({
            data: {
                product: mockProducts.slice(0, 2),
                product_aggregate: { aggregate: { count: 12 } },
            },
        }));
        products.getPriceBounds.mockReturnValue(of({
            data: { product_aggregate: { aggregate: { min: { price: 25 }, max: { price: 900 } } } },
        }));
        products.getProductCategories.mockReturnValue(of({ data: { category: ['Electronics'] } }));

        component.ngOnInit();

        expect(component.products).toEqual(mockProducts.slice(0, 2));
        expect(component.totalRecords).toBe(12);
        expect(component.numberOfProducts).toBe(12);
        expect(component.rangeValues).toEqual([25, 900]);
        expect(component.categories).toEqual(['Electronics']);
        expect(component.items[0].label).toBe('Products');
        expect(component.home).toEqual({ icon: 'icon-[tabler--home]', routerLink: '/home' });
        expect(component.sortOptions).toHaveLength(2);
        expect(component.isLoading).toBe(false);
    });

    it('shows a recoverable catalog error when page loading fails', () => {
        products.getProductsPage.mockReturnValue(throwError(() => new Error('offline')));

        component.ngOnInit();

        expect(component.catalogError).toContain('could not load products');
        expect(component.products).toEqual([]);
        expect(component.isLoading).toBe(false);
    });

    it('uses a navigation-state category filter', () => {
        router.getCurrentNavigation.mockReturnValue({ extras: { state: { filters: 'Electronics' } } });
        const stateComponent = TestBed.createComponent(ProductsViewComponent).componentInstance;

        stateComponent.ngOnInit();

        expect(products.getProductsPage).toHaveBeenLastCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ category: { name: { _eq: 'Electronics' } } }),
            }),
        );
    });

    it('restores a history-state category when navigation extras are unavailable', () => {
        window.history.replaceState({ filters: 'Kitchen' }, '', '/products/search');
        const historyComponent = TestBed.createComponent(ProductsViewComponent).componentInstance;

        historyComponent.ngOnInit();

        expect(products.getProductsPage).toHaveBeenLastCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ category: { name: { _eq: 'Kitchen' } } }),
            }),
        );
    });

    it('initializes when history has no state object', () => {
        window.history.replaceState(null, '', '/products/search');
        const noHistoryComponent = TestBed.createComponent(ProductsViewComponent).componentInstance;

        expect(() => noHistoryComponent.ngOnInit()).not.toThrow();
    });

    it('reacts to category and later query-parameter changes', () => {
        component.ngOnInit();
        products.getProductsPage.mockClear();

        products.categoryFilter.next('Electronics');
        queryParams.next({ q: 'tablet' });

        expect(products.getPriceBounds).toHaveBeenLastCalledWith({
            category: { name: { _eq: 'Electronics' } },
        });
        expect(products.getProductsPage).toHaveBeenCalledTimes(2);
        expect(products.getProductsPage).toHaveBeenLastCalledWith(
            expect.objectContaining({
                where: {
                    name: { _ilike: '%tablet%' },
                    category: { name: { _eq: 'Electronics' } },
                },
            }),
        );
    });

    it('combines search, category, subcategory, and price filters', () => {
        component.ngOnInit();
        component.searchInput = 'phone';
        component.categoriesFilter = 'Electronics';
        component.applyFilters(['Smartphones']);
        component.lowestPrice = 0;
        component.highestPrice = 1000;
        component.rangeValues = [100, 500];
        component.commitPriceRange();

        expect(products.getProductsPage).toHaveBeenLastCalledWith(
            expect.objectContaining({
                where: {
                    name: { _ilike: '%phone%' },
                    category: { name: { _eq: 'Electronics' } },
                    subcategory: { name: { _in: ['Smartphones'] } },
                    price: { _gte: 100, _lte: 500 },
                },
            }),
        );
    });

    it('falls back to zero when aggregate price bounds are absent', () => {
        products.getPriceBounds.mockReturnValue(of({
            data: { product_aggregate: { aggregate: { min: null, max: undefined } } },
        }));

        component.ngOnInit();

        expect(component.lowestPrice).toBe(0);
        expect(component.highestPrice).toBe(0);
        expect(component.rangeValues).toEqual([0, 0]);
    });

    it('does not overwrite an active price filter when bounds reload', () => {
        component.priceFrom = 100;
        component.priceTo = 200;
        component.rangeValues = [100, 200];

        component.ngOnInit();

        expect(component.rangeValues).toEqual([100, 200]);
    });

    it('handles pagination boundaries and page-size changes', () => {
        component.ngOnInit();
        products.getProductsPage.mockClear();

        component.loadData({ first: 10, rows: 5 });
        expect(component.currentPage).toBe(3);
        component.totalRecords = 21;
        expect(component.totalPages).toBe(5);

        component.previousPage();
        expect(component.first).toBe(5);
        component.totalRecords = 21;
        component.nextPage();
        expect(component.first).toBe(10);

        component.first = 0;
        component.previousPage();
        expect(component.first).toBe(0);

        component.first = 20;
        component.nextPage();
        expect(component.first).toBe(20);

        component.loadData({});
        expect(component.first).toBe(0);
        expect(component.rows).toBe(5);

        component.onRowsChange(25);
        expect(component.rows).toBe(25);
        expect(component.first).toBe(0);
    });

    it('applies sort, retry, and nullable subcategory filter changes', () => {
        component.ngOnInit();
        component.first = 20;

        component.onSortChange({ value: 'desc' });
        expect(component.sortKey).toBe('desc');
        expect(component.first).toBe(0);

        component.applyFilters(null as any);
        expect(products.getProductsPage).toHaveBeenLastCalledWith(
            expect.objectContaining({ where: { name: { _ilike: '%phone%' } } }),
        );

        component.first = 10;
        component.retryCatalogLoad();
        expect(component.first).toBe(0);
    });

    it('debounces and deduplicates search input', () => {
        jest.useFakeTimers();
        queryParams.next({});
        component.ngOnInit();
        products.getProductsPage.mockClear();

        component.onChanges('  laptop  ');
        jest.advanceTimersByTime(301);
        expect(component.searchInput).toBe('laptop');
        expect(products.getProductsPage).toHaveBeenCalledTimes(1);

        component.onChanges('laptop');
        jest.advanceTimersByTime(301);
        expect(products.getProductsPage).toHaveBeenCalledTimes(1);

        component.onChanges(null as any);
        jest.advanceTimersByTime(301);
        expect(component.searchInput).toBe('');
        jest.useRealTimers();
    });

    describe('price range', () => {
        const input = (value: string) => ({ value } as HTMLInputElement);

        beforeEach(() => {
            products.getPriceBounds.mockReturnValue(of({
                data: { product_aggregate: { aggregate: { min: { price: 100 }, max: { price: 900 } } } },
            }));
            component.ngOnInit();
            products.getProductsPage.mockClear();
        });

        it('keeps the slider thumbs from crossing and only queries on commit', () => {
            const min = input('950');
            component.onMinSliderInput(min);
            expect(min.value).toBe('900');
            expect(component.rangeValues).toEqual([900, 900]);
            expect(component.isPriceMinOnTop).toBe(true);

            const max = input('50');
            component.onMaxSliderInput(max);
            expect(max.value).toBe('900');

            component.onMinSliderInput(input('300'));
            component.onMaxSliderInput(input('700'));
            expect(component.rangeValues).toEqual([300, 700]);
            expect(component.isPriceMinOnTop).toBe(false);
            expect(component.priceFillStart).toBe(25);
            expect(component.priceFillEnd).toBe(75);
            expect(products.getProductsPage).not.toHaveBeenCalled();

            component.commitPriceRange();
            expect(products.getProductsPage).toHaveBeenCalledTimes(1);
            expect(products.getProductsPage).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ price: { _gte: 300, _lte: 700 } }),
                    offset: 0,
                }),
            );

            component.commitPriceRange();
            expect(products.getProductsPage).toHaveBeenCalledTimes(1);
        });

        it('drops the price condition when the full range is selected again', () => {
            component.rangeValues = [200, 800];
            component.commitPriceRange();
            component.rangeValues = [100, 900];
            component.commitPriceRange();

            expect(component.priceFrom).toBeNull();
            expect(component.priceTo).toBeNull();
            expect(products.getProductsPage).toHaveBeenLastCalledWith(
                expect.objectContaining({ where: { name: { _ilike: '%phone%' } } }),
            );
        });

        it('normalizes typed prices to the bounds and the opposite value', () => {
            const min = input('50');
            component.onMinPriceInput(min);
            expect(min.value).toBe('100');

            const max = input('650');
            component.onMaxPriceInput(max);
            expect(component.rangeValues).toEqual([100, 650]);
            expect(component.priceTo).toBe(650);

            const crossingMin = input('700');
            component.onMinPriceInput(crossingMin);
            expect(crossingMin.value).toBe('650');

            const crossingMax = input('500');
            component.onMaxPriceInput(crossingMax);
            expect(crossingMax.value).toBe('650');

            const clearedMin = input('  ');
            component.onMinPriceInput(clearedMin);
            expect(clearedMin.value).toBe('100');

            const invalidMax = input('abc');
            component.onMaxPriceInput(invalidMax);
            expect(invalidMax.value).toBe('900');
            expect(component.priceFrom).toBeNull();
            expect(component.priceTo).toBeNull();
        });

        it('reports a zero-width fill when the bounds collapse', () => {
            component.lowestPrice = 500;
            component.highestPrice = 500;
            component.rangeValues = [500, 500];
            expect(component.priceFillStart).toBe(0);
            expect(component.priceFillEnd).toBe(0);
        });

        it('resets the price filter when the category changes', () => {
            component.rangeValues = [200, 300];
            component.commitPriceRange();

            products.categoryFilter.next('Electronics');

            expect(component.priceFrom).toBeNull();
            expect(component.priceTo).toBeNull();
            expect(component.rangeValues).toEqual([100, 900]);
        });
    });

    it('falls back to an empty category list when categories fail to load', () => {
        products.getProductCategories.mockReturnValue(throwError(() => new Error('offline')));
        component.ngOnInit();
        expect(component.categories).toEqual([]);
    });

    it('disposes all subscriptions on destroy', () => {
        const dispose = jest.spyOn(component.subs, 'dispose');
        component.ngOnDestroy();
        expect(dispose).toHaveBeenCalled();
    });

    it('can be destroyed before subscriptions are assigned', () => {
        (component as any).subs = undefined;
        expect(() => component.ngOnDestroy()).not.toThrow();
    });
});
