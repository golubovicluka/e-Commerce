import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../products.service';
import { MenuItem } from 'primeng/api';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-categories-view',
  templateUrl: './categories-view.component.html',
  styleUrls: ['./categories-view.component.scss']
})
export class CategoriesViewComponent implements OnInit {
  categories!: any[];

  public items!: MenuItem[];
  home!: MenuItem;

  constructor(
    private _productsService: ProductsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this._productsService.getProductCategories().subscribe((categories: any) => {
      this.categories = categories.data.category;
    });
    this.items = [
      { label: 'Categories', routerLink: '/categories' },
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/home' };
  }

  openProductsPage(categoryName: string) {
    this._productsService.setCategoryFilter(categoryName);
    const navigationExtras: NavigationExtras = {
      state: {
        filters: categoryName
      }
    }

    this.router.navigate(['/products/search'], navigationExtras);
  }

}
