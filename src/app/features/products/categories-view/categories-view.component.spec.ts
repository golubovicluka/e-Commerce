import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { CategoriesViewComponent } from './categories-view.component';
import { ProductsService } from '../products.service';
import { mockCategoriesWithSubcategories } from 'src/app/testing/mock-data';

describe('CategoriesViewComponent', () => {
    let component: CategoriesViewComponent;
    let fixture: ComponentFixture<CategoriesViewComponent>;
    let products: any;

    beforeEach(async () => {
        products = {
            getProductCategories: jest.fn().mockName("ProductsService.getProductCategories"),
        };
        products.getProductCategories.mockReturnValue(of({ data: { category: mockCategoriesWithSubcategories } }) as any);

        await TestBed.configureTestingModule({
    imports: [CategoriesViewComponent],
    providers: [
        { provide: ProductsService, useValue: products },
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

    it('ngOnInit sets the Tabler home icon for the breadcrumb', () => {
        component.ngOnInit();
        expect(component.home).toEqual({ icon: 'icon-[tabler--home]', routerLink: '/home' });
    });
});
