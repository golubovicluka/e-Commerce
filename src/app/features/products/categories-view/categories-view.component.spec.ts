import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { CategoriesViewComponent } from './categories-view.component';
import { ProductsService } from '../products.service';
import { mockCategoriesWithSubcategories } from 'src/app/testing/mock-data';

/**
 * The CLI stub threw `No provider for Apollo!` via ProductsService. We swap in a
 * ProductsService double (so no Apollo graph is needed) and a Router spy, then
 * cover ngOnInit and the navigation/filter handoff.
 */
describe('CategoriesViewComponent', () => {
  let component: CategoriesViewComponent;
  let fixture: ComponentFixture<CategoriesViewComponent>;
  let products: jasmine.SpyObj<ProductsService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    products = jasmine.createSpyObj('ProductsService', ['getProductCategories', 'setCategoryFilter']);
    products.getProductCategories.and.returnValue(
      of({ data: { category: mockCategoriesWithSubcategories } }) as any
    );
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [CategoriesViewComponent],
      providers: [
        { provide: ProductsService, useValue: products },
        { provide: Router, useValue: router },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit loads categories from the service', () => {
    component.ngOnInit();
    expect(component.categories).toEqual(mockCategoriesWithSubcategories);
  });

  it('openProductsPage sets the category filter and navigates with state', () => {
    component.openProductsPage('Electronics');
    expect(products.setCategoryFilter).toHaveBeenCalledOnceWith('Electronics');
    expect(router.navigate).toHaveBeenCalledWith(
      ['/products/search'],
      jasmine.objectContaining({ state: { filters: 'Electronics' } })
    );
  });
});
