import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from './Product';
import { ProductsService } from './products.service';
import { SubscriptionContainer } from './SubscriptionContainer';
import { ConfirmationService, MessageService } from 'primeng/api';
import { StoreService } from '../../shared/store.service';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products-view',
  templateUrl: './products-view.component.html',
  styleUrls: ['./products-view.component.scss'],
})
export class ProductsViewComponent implements OnInit, OnDestroy {
  products$!: Observable<any>
  subs = new SubscriptionContainer();
  categories!: any;

  // Sorting
  sortOptions!: any[];
  sortKey!: string;
  sortField!: string;
  sortOrder!: number;

  isLoading = true;

  searchInput = '';

  public items!: MenuItem[];
  home!: MenuItem;

  constructor(
    private _productService: ProductsService,
    private _messageService: MessageService,
    private _storeService: StoreService,
    private router: Router
  ) { }

  ngOnInit() {
    this._productService.getProducts().subscribe((products: any) => {
      this.products$ = of(products.data.product);
      console.log(products.data.product);
      this.isLoading = false;
    });

    this._productService.getProductCategories().subscribe((categories: any) => {
      this.categories = categories.data.category;
    })

    // Breadcrumbs
    this.items = [
      { label: 'Products', routerLink: '/products' },
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/home' };

    this.sortOptions = [
      { label: 'Price: Low to High', value: 'asc' },
      { label: 'Price: High to Low', value: 'desc' },
    ];
  }

  onChanges(changes: any) {
    this.searchInput = changes;
    this._productService.searchProducts(changes).subscribe((product: any) => {
      this.products$ = of(product.data.product);
    })
  }

  trackByProductId(index: number, product: Product): number {
    return index;
  }

  applyFilters(filtersObject: any) {
    this._productService.getFilteredProducts(filtersObject).subscribe((product: any) => {
      this.products$ = of(product.data.product);
    })
  }

  getByCategory(selectedCategory: string) {
    this._productService.getProductByCategory(selectedCategory).subscribe((products: any) => {
      this.products$ = of(products.data.product);
    })
  }

  ngOnDestroy() {
    this.subs?.dispose()
  }

  filterCategories(categories: string[]) {
    this._productService.getProductsFromCategories(categories).subscribe((products: any) => {
      this.products$ = of(products.data.product)
    })
  }

  addToWishList(wishListItem: any[]) {
    this._storeService.addWishListItem(wishListItem);
  }

  removedFromWishList(wishListItem: any[]) {
    this._storeService.removeWishListItem(wishListItem);
  }

  // For pagination
  loadData(event: any) {
    event.first = 3
    event.rows = 3;
  }

  // TODO: move this to separate component - product-list or product component - different template
  openProductDetails(id: number) {
    this.router.navigate(['/products', id]);
  }

  onSortChange(event: any) {
    this._productService.getProducts(event.value).subscribe((product: any) => {
      this.products$ = of(product.data.product);
      this.isLoading = false;
    })

    // let value = event.value;

    // if (value.indexOf('!') === 0) {
    //   this.sortOrder = -1;
    //   this.sortField = value.substring(1, value.length);
    // }
    // else {
    //   this.sortOrder = 1;
    //   this.sortField = value;
    // }
  }

}
