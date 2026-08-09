import { DecimalPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { BreadcrumbComponent } from 'src/app/shared/breadcrumb/breadcrumb.component';
import { NavigationItem } from 'src/app/shared/navigation-item';
import {
  buildCatalogWhere,
  catalogQueriesEqual,
  CatalogPageSize,
  CatalogQueryState,
  DEFAULT_CATALOG_QUERY,
  parseCatalogQuery,
} from './catalog-query';
import { FiltersComponent } from './filters/filters.component';
import { Product } from './Product';
import { ProductComponent } from './product/product.component';
import {
  CatalogCategory,
  PriceBoundsData,
  ProductsPageData,
  ProductsService,
  SortDirection,
} from './products.service';

interface CatalogLoadResult {
  page: ProductsPageData | null;
  bounds: PriceBoundsData | null;
}

interface SortOption {
  label: string;
  value: SortDirection;
}

@Component({
  selector: 'app-products-view',
  templateUrl: './products-view.component.html',
  styleUrls: ['./products-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BreadcrumbComponent,
    NgClass,
    FiltersComponent,
    FormsModule,
    ProductComponent,
    DecimalPipe,
  ],
})
export class ProductsViewComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchTerms$ = new Subject<string>();
  private readonly priceChanges$ = new Subject<[number, number]>();
  private readonly retryRequests$ = new Subject<void>();
  private activeQuery: CatalogQueryState = DEFAULT_CATALOG_QUERY;

  products: Product[] = [];
  categories: CatalogCategory[] = [];
  totalRecords = 0;
  rows: CatalogPageSize = DEFAULT_CATALOG_QUERY.pageSize;
  first = 0;
  sortKey: SortDirection = DEFAULT_CATALOG_QUERY.sort;
  readonly sortOptions: readonly SortOption[] = [
    { label: 'Price: Low to High', value: 'asc' },
    { label: 'Price: High to Low', value: 'desc' },
  ];

  priceFrom: number | null = null;
  priceTo: number | null = null;
  rangeValues: [number, number] = [0, 0];
  highestPrice = 0;
  lowestPrice = 0;

  isLoading = true;
  catalogError: string | null = null;
  filterError: string | null = null;
  searchInput = '';
  categoryId: number | null = null;
  categoryName = '';
  subcategoryFilters: number[] = [];

  readonly items: NavigationItem[] = [
    { label: 'Products', routerLink: '/products/search' },
  ];
  readonly home: NavigationItem = { icon: 'pi pi-home', routerLink: '/home' };
  filtersOpen = false;
  layout: 'list' | 'grid' = DEFAULT_CATALOG_QUERY.layout;

  constructor(
    private readonly productsService: ProductsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.connectSearchInput();
    this.connectPriceInput();
    this.loadCategories();

    this.route.queryParamMap
      .pipe(
        map(parseCatalogQuery),
        distinctUntilChanged(catalogQueriesEqual),
        tap((state) => this.applyQueryState(state)),
        switchMap((state) =>
          this.retryRequests$.pipe(
            startWith(undefined),
            tap(() => {
              this.isLoading = true;
              this.catalogError = null;
              this.changeDetectorRef.markForCheck();
            }),
            switchMap(() => this.loadCatalog(state)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => this.applyCatalogResult(result));
  }

  get currentPage(): number {
    return Math.floor(this.first / this.rows) + 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.rows));
  }

  get selectedCategoryName(): string {
    if (this.categoryName) return this.categoryName;
    return this.categories.find((category) => category.id === this.categoryId)?.name ?? '';
  }

  get hasActiveFilters(): boolean {
    return Boolean(
      this.searchInput ||
        this.categoryId !== null ||
        this.categoryName ||
        this.subcategoryFilters.length > 0 ||
        this.priceFrom !== null ||
        this.priceTo !== null,
    );
  }

  retryCatalogLoad(): void {
    this.retryRequests$.next();
    if (this.filterError) this.loadCategories();
  }

  previousPage(): void {
    if (this.currentPage <= 1) return;
    this.updateQuery({ page: this.currentPage - 1 });
  }

  nextPage(): void {
    if (this.currentPage >= this.totalPages) return;
    this.updateQuery({ page: this.currentPage + 1 });
  }

  onRowsChange(rows: number): void {
    if (![10, 20, 30].includes(Number(rows))) return;
    this.updateQuery({ pageSize: Number(rows), page: null });
  }

  onChanges(searchInput: string): void {
    this.searchTerms$.next(searchInput ?? '');
  }

  applyFilters(subcategoryIds: number[]): void {
    this.updateQuery({
      subcategoryId: subcategoryIds.length > 0 ? subcategoryIds : null,
      page: null,
    });
  }

  onSortChange(sort: SortDirection): void {
    if (sort !== 'asc' && sort !== 'desc') return;
    this.updateQuery({ sort: sort === 'asc' ? null : sort, page: null });
  }

  onPriceInputChange(index: 0 | 1, value: number | string): void {
    const parsed = Number(value);
    this.rangeValues[index] = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    this.priceChanges$.next([...this.rangeValues]);
  }

  handlePriceFilter(values: [number, number]): void {
    const normalized: [number, number] = [
      Math.max(0, Number(values[0]) || 0),
      Math.max(0, Number(values[1]) || 0),
    ];
    this.rangeValues = normalized;
    this.applyPriceRange(normalized);
  }

  setLayout(layout: 'list' | 'grid'): void {
    this.updateQuery({ layout: layout === 'grid' ? null : layout }, true);
  }

  clearFilters(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
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
  }

  private connectSearchInput(): void {
    this.searchTerms$
      .pipe(
        map((term) => term.trim().slice(0, 100)),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => {
        this.updateQuery({ q: term || null, page: null }, true);
      });
  }

  private connectPriceInput(): void {
    this.priceChanges$
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => this.applyPriceRange(values));
  }

  private applyPriceRange(values: [number, number]): void {
    const [minimum, maximum] = values[0] <= values[1] ? values : [values[1], values[0]];
    this.rangeValues = [minimum, maximum];
    this.updateQuery({
      minPrice: minimum === this.lowestPrice ? null : minimum,
      maxPrice: maximum === this.highestPrice ? null : maximum,
      page: null,
    });
  }

  private loadCategories(): void {
    this.filterError = null;
    this.productsService
      .getProductCategories()
      .pipe(
        take(1),
        map((response) => response.data?.category ?? []),
        catchError(() => {
          this.filterError = 'Categories could not be loaded.';
          return of([] as CatalogCategory[]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((categories) => {
        this.categories = categories;
        this.changeDetectorRef.markForCheck();
      });
  }

  private loadCatalog(state: CatalogQueryState): Observable<CatalogLoadResult> {
    const where = buildCatalogWhere(state);
    const boundsWhere = buildCatalogWhere(state, false);

    return forkJoin({
      page: this.productsService
        .getProductsPage({
          where,
          orderBy: [{ price: state.sort }],
          limit: state.pageSize,
          offset: (state.page - 1) * state.pageSize,
        })
        .pipe(
          take(1),
          map((response) => response.data ?? null),
          catchError(() => of(null)),
        ),
      bounds: this.productsService.getPriceBounds(boundsWhere).pipe(
        take(1),
        map((response) => response.data ?? null),
        catchError(() => of(null)),
      ),
    });
  }

  private applyQueryState(state: CatalogQueryState): void {
    this.activeQuery = state;
    this.searchInput = state.search;
    this.categoryId = state.categoryId;
    this.categoryName = state.categoryName;
    this.subcategoryFilters = state.subcategoryIds;
    this.sortKey = state.sort;
    this.rows = state.pageSize;
    this.first = (state.page - 1) * state.pageSize;
    this.priceFrom = state.minPrice;
    this.priceTo = state.maxPrice;
    this.layout = state.layout;
  }

  private applyCatalogResult(result: CatalogLoadResult): void {
    if (result.page) {
      this.products = result.page.product;
      this.totalRecords = result.page.product_aggregate.aggregate.count;
    } else {
      this.products = [];
      this.totalRecords = 0;
      this.catalogError = 'We could not load products right now. Please try again later.';
    }

    if (result.bounds) {
      const aggregate = result.bounds.product_aggregate.aggregate;
      this.lowestPrice = aggregate.min?.price ?? 0;
      this.highestPrice = aggregate.max?.price ?? 0;
      this.rangeValues = [
        this.activeQuery.minPrice ?? this.lowestPrice,
        this.activeQuery.maxPrice ?? this.highestPrice,
      ];
    }

    this.isLoading = false;
    this.changeDetectorRef.markForCheck();
  }

  private updateQuery(queryParams: Params, replaceUrl = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }
}
