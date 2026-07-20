import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, take, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Product } from './Product';
import { ProductsService } from './products.service';
import { SubscriptionContainer } from './SubscriptionContainer';
import { WishlistService } from '../../shared/wishlist.service';
import { NavigationItem } from 'src/app/shared/navigation-item';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/shared/cart.service';
import { NgClass, DecimalPipe } from '@angular/common';
import { FiltersComponent } from './filters/filters.component';
import { FormsModule } from '@angular/forms';
import { ProductComponent } from './product/product.component';
import { BreadcrumbComponent } from 'src/app/shared/breadcrumb/breadcrumb.component';

@Component({
    selector: 'app-products-view',
    templateUrl: './products-view.component.html',
    styleUrls: ['./products-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BreadcrumbComponent, NgClass, FiltersComponent, FormsModule, ProductComponent, DecimalPipe]
})
export class ProductsViewComponent implements OnInit, OnDestroy {
  // Current page of products (server-side paginated — never the whole table).
  products: Product[] = [];
  totalRecords = 0;
  rows = 10;
  first = 0;

  subs = new SubscriptionContainer();
  categories!: any;

  // Sorting
  sortOptions!: any[];
  sortKey: 'asc' | 'desc' = 'asc';

  // Price range
  priceFrom: number | null = null;
  priceTo: number | null = null;
  rangeValues: number[] = [];
  highestPrice = 0;
  lowestPrice = 0;

  numberOfProducts = 0;
  isLoading = true;
  catalogError: string | null = null;

  searchInput = '';
  categoriesFilter!: string;
  private subcategoryFilters: string[] = [];

  // Streams that drive data loading. Funnelling every interaction through a
  // single pipeline (below) means at most one query is ever in flight.
  private searchTerms$ = new Subject<string>();
  private priceChanges$ = new Subject<void>();
  private pageRequests$ = new Subject<void>();

  public items!: NavigationItem[];
  home!: NavigationItem;
  filtersOpen = false;
  layout: 'list' | 'grid' = 'grid';

  constructor(
    private _productService: ProductsService,
    private _wishlistService: WishlistService,
    private _cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { filters: any };
    const filters = state?.filters;
    if (filters) {
      this.categoriesFilter = filters;
    }
  }

  ngOnInit() {
    const historyFilters = history.state?.filters;
    if (historyFilters && !this.categoriesFilter) {
      this.categoriesFilter = historyFilters;
    }

    this.subs.add(
      this._productService.categoryFilter.subscribe((category) => {
        this.categoriesFilter = category;
        this.loadPriceBounds();
        this.resetToFirstPage();
        this.changeDetectorRef.markForCheck();
      })
    );

    // Single product-loading pipeline. `switchMap` cancels any in-flight
    // request when a new one starts, so only one finite query is ever active.
    // This replaces the previous pattern of creating a long-lived watched query
    // on every keystroke/filter/sort interaction.
    this.subs.add(
      this.pageRequests$
        .pipe(
          tap(() => {
            this.isLoading = true;
            this.catalogError = null;
          }),
          switchMap(() =>
            this._productService.getProductsPage({
              where: this.buildWhere(),
              orderBy: [{ price: this.sortKey }],
              limit: this.rows,
              offset: this.first,
            }).pipe(
              catchError(() => {
                this.catalogError = 'We could not load products right now. Please try again later.';
                return of({
                  data: {
                    product: [],
                    product_aggregate: { aggregate: { count: 0 } },
                  },
                });
              })
            )
          )
        )
        .subscribe((result: any) => {
          if (!this.catalogError) {
            this.products = result.data.product;
            this.totalRecords = result.data.product_aggregate.aggregate.count;
            this.numberOfProducts = this.totalRecords;
          }
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        })
    );

    // Debounced search: one request per pause in typing, not one per keystroke.
    this.subs.add(
      this.searchTerms$
        .pipe(
          map((term) => (term ?? '').trim()),
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe((term) => {
          this.searchInput = term;
          this.resetToFirstPage();
          this.changeDetectorRef.markForCheck();
        })
    );

    // The price number inputs emit on every keystroke; debounce before querying.
    this.subs.add(
      this.priceChanges$.pipe(debounceTime(400)).subscribe(() => {
        this.priceFrom = this.rangeValues[0];
        this.priceTo = this.rangeValues[1];
        this.resetToFirstPage();
        this.changeDetectorRef.markForCheck();
      })
    );

    // Price-slider bounds come from a DB aggregate, independent of the page.
    this.loadPriceBounds();

    // Categories for the filter sidebar.
    this.subs.add(
      this._productService.getProductCategories().subscribe((categories: any) => {
        this.categories = categories.data.category;
        this.changeDetectorRef.markForCheck();
      })
    );

    // Breadcrumbs
    this.items = [{ label: 'Products', routerLink: '/products/search' }];
    this.home = { icon: 'pi pi-home', routerLink: '/home' };

    this.sortOptions = [
      { label: 'Price: Low to High', value: 'asc' },
      { label: 'Price: High to Low', value: 'desc' },
    ];

    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        const query = (params['q'] ?? '').trim();
        if (query !== this.searchInput) {
          this.searchInput = query;
          this.resetToFirstPage();
          this.changeDetectorRef.markForCheck();
        }
      })
    );

    this.fetchPage();
  }

  /** Builds one Hasura `where` expression from all active filters (AND-combined). */
  private buildWhere(): any {
    const where: any = {};
    if (this.searchInput) {
      where.name = { _ilike: `%${this.searchInput}%` };
    }
    if (this.categoriesFilter) {
      where.category = { name: { _eq: this.categoriesFilter } };
    }
    if (this.subcategoryFilters.length) {
      where.subcategory = { name: { _in: this.subcategoryFilters } };
    }
    if (this.priceFrom != null && this.priceTo != null) {
      where.price = { _gte: this.priceFrom, _lte: this.priceTo };
    }
    return where;
  }

  private loadPriceBounds(): void {
    const where: any = this.categoriesFilter
      ? { category: { name: { _eq: this.categoriesFilter } } }
      : {};
    this.subs.add(
      this._productService.getPriceBounds(where).pipe(take(1)).subscribe((res: any) => {
        const aggregate = res.data.product_aggregate.aggregate;
        this.lowestPrice = aggregate.min?.price ?? 0;
        this.highestPrice = aggregate.max?.price ?? 0;
        // Only seed the slider range while the user hasn't set a price filter.
        if (this.priceFrom == null && this.priceTo == null) {
          this.rangeValues = [this.lowestPrice, this.highestPrice];
        }
        this.changeDetectorRef.markForCheck();
      })
    );
  }

  retryCatalogLoad(): void {
    this.resetToFirstPage();
  }

  /** Reset to page 1 and reload; the dataView paginator follows `first`. */
  private resetToFirstPage(): void {
    this.first = 0;
    this.fetchPage();
  }

  private fetchPage(): void {
    this.pageRequests$.next();
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  // --- Template event handlers ---

  // Pagination. Also fires once on init via p-dataView's lazy load, which is
  // what performs the very first fetch.
  loadData(event: any) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? this.rows;
    this.fetchPage();
  }

  get currentPage(): number {
    return Math.floor(this.first / this.rows) + 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.rows));
  }

  previousPage(): void {
    if (this.first === 0) return;
    this.first = Math.max(0, this.first - this.rows);
    this.fetchPage();
  }

  nextPage(): void {
    if (this.currentPage >= this.totalPages) return;
    this.first += this.rows;
    this.fetchPage();
  }

  onRowsChange(rows: number): void {
    this.rows = Number(rows);
    this.resetToFirstPage();
  }

  onChanges(searchInput: string) {
    this.searchTerms$.next(searchInput);
  }

  applyFilters(subcategoryNames: string[]) {
    this.subcategoryFilters = subcategoryNames ?? [];
    this.resetToFirstPage();
  }

  onSortChange(event: any) {
    this.sortKey = event.value;
    this.resetToFirstPage();
  }

  handlePriceFilter(event: any) {
    this.priceFrom = event.values[0];
    this.priceTo = event.values[1];
    this.resetToFirstPage();
  }

  onPriceChange(_event: any) {
    this.priceChanges$.next();
  }

  addToWishList(product: Product) {
    this._wishlistService.addWishListItem(product);
  }

  removedFromWishList(product: Product) {
    this._wishlistService.removeWishListItem(product);
  }

  openProductDetails(id: number) {
    this.router.navigate(['/product', id]);
  }

  addToCart(product: Product) {
    this._cartService.addToCart(product);
  }

  removeFromCart(product: Product) {
    this._cartService.removeFromCart(product);
  }

  ngOnDestroy() {
    this.subs?.dispose();
  }
}
