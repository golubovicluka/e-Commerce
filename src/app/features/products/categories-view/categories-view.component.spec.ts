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
 * cover ngOnInit and URL-addressable category navigation.
 */
describe('CategoriesViewComponent', () => {
    let component: CategoriesViewComponent;
    let fixture: ComponentFixture<CategoriesViewComponent>;
    let products: any;
    let router: any;

    beforeEach(async () => {
        products = {
            getProductCategories: jest.fn().mockName("ProductsService.getProductCategories"),
        };
        products.getProductCategories.mockReturnValue(of({ data: { category: mockCategoriesWithSubcategories } }) as any);
        router = {
            navigate: jest.fn().mockName("Router.navigate")
        };

        await TestBed.configureTestingModule({
    imports: [CategoriesViewComponent],
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

    it('falls back to an empty category list when Apollo returns no data', async () => {
        products.getProductCategories.mockReturnValue(of({ data: undefined }));
        const emptyFixture = TestBed.createComponent(CategoriesViewComponent);

        await emptyFixture.whenStable();

        expect(emptyFixture.componentInstance.categories).toEqual([]);
    });

    it('opens a category through a shareable query parameter', () => {
        component.openProductsPage('Electronics');
        expect(router.navigate).toHaveBeenCalledWith(['/products/search'], {
            queryParams: { category: 'Electronics' },
        });
    });
});
