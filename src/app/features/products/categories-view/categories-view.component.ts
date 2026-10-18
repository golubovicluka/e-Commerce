import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProductsService } from '../products.service';
import { NavigationItem } from 'src/app/shared/navigation-item';
import { CategoryComponent } from './category/category.component';
import { BreadcrumbComponent } from 'src/app/shared/breadcrumb/breadcrumb.component';

@Component({
    selector: 'app-categories-view',
    templateUrl: './categories-view.component.html',
    styleUrls: ['./categories-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BreadcrumbComponent, CategoryComponent]
})
export class CategoriesViewComponent implements OnInit {
  private readonly categoriesState = toSignal(
    this._productsService
      .getProductCategories()
      .pipe(map((response: any) => response.data.category as any[])),
    { initialValue: undefined },
  );

  public items!: NavigationItem[];
  home!: NavigationItem;

  constructor(private _productsService: ProductsService) { }

  get categories(): any[] | undefined {
    return this.categoriesState();
  }

  ngOnInit(): void {
    this.items = [
      { label: 'Categories', routerLink: '/categories' },
    ];
    this.home = { icon: 'icon-[tabler--home]', routerLink: '/home' };
  }

}
