import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { mockCategoriesWithSubcategories, mockProduct, mockProducts } from '../../testing/mock-data';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
    let service: ProductsService;
    let controller: HttpTestingController;

    function expectOperation(operationName: string) {
        const req = controller.expectOne(environment.graphqlEndpoint);
        expect(req.request.method).toBe('POST');
        expect(req.request.body.operationName).toBe(operationName);
        expect(req.request.body.query).toContain(`query ${operationName}`);
        return req;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                ProductsService,
            ],
        });
        service = TestBed.inject(ProductsService);
        controller = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        controller.verify();
    });

    describe('Initialization', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });
    });

    describe('setCategoryFilter', () => {
        it('emits the category on the categoryFilter stream', () => {
            let received = '';
            service.categoryFilter.subscribe((value) => {
                received = value;
            });
            service.setCategoryFilter('Electronics');
            expect(received).toBe('Electronics');
        });

        it('emits every pushed category in order', () => {
            const received: string[] = [];
            service.categoryFilter.subscribe((v) => received.push(v));

            ['Electronics', 'Clothing', 'Home & Garden'].forEach((c) => service.setCategoryFilter(c));

            expect(received).toEqual(['Electronics', 'Clothing', 'Home & Garden']);
        });
    });

    describe('server-side catalog queries', () => {
        it('requests a page with default filters and sorting', () => {
            service.getProductsPage({ limit: 10, offset: 20 }).subscribe();

            const req = expectOperation('GetProductsPage');
            expect(req.request.body.variables).toEqual({
                where: {},
                orderBy: [{ price: 'asc' }],
                limit: 10,
                offset: 20,
            });
            req.flush({
                data: {
                    product: [],
                    product_aggregate: { aggregate: { count: 0 } },
                },
            });
        });

        it('requests a page with explicit where and orderBy expressions', () => {
            const where = { name: { _ilike: '%phone%' } };
            const orderBy = [{ price: 'desc' }];
            service.getProductsPage({ where, orderBy, limit: 5, offset: 0 }).subscribe();

            const req = expectOperation('GetProductsPage');
            expect(req.request.body.variables).toEqual({ where, orderBy, limit: 5, offset: 0 });
            req.flush({
                data: {
                    product: [],
                    product_aggregate: { aggregate: { count: 0 } },
                },
            });
        });

        it('requests global and filtered price bounds', () => {
            service.getPriceBounds().subscribe();
            const global = expectOperation('GetPriceBounds');
            expect(global.request.body.variables).toEqual({ where: {} });
            global.flush({ data: { product_aggregate: { aggregate: { min: null, max: null } } } });

            const where = { category: { name: { _eq: 'Electronics' } } };
            service.getPriceBounds(where).subscribe();
            const filtered = expectOperation('GetPriceBounds');
            expect(filtered.request.body.variables).toEqual({ where });
            filtered.flush({ data: { product_aggregate: { aggregate: { min: null, max: null } } } });
        });

        it('requests products by id list', () => {
            service.getProductsByIds([1, 4, 13]).subscribe();

            const req = expectOperation('GetProductsByIds');
            expect(req.request.body.variables).toEqual({ ids: [1, 4, 13] });
            req.flush({ data: { product: [] } });
        });
    });

    describe('getProductById', () => {
        it('sends the id, returns the product, and reuses the cached response for identical calls', () => {
            const results: number[] = [];
            service.getProductById(5).subscribe((r: any) => {
                results.push(r.data.product[0].id);
            });

            const req = expectOperation('GetProductById');
            expect(req.request.body.variables).toEqual({ id: 5 });
            req.flush({ data: { product: [mockProducts[4]] } });

            service.getProductById(5).subscribe((r: any) => {
                results.push(r.data.product[0].id);
            });

            expect(results).toEqual([5, 5]);
        });

        it('returns an empty list for a non-existent id', () => {
            let products: unknown;
            service.getProductById(999).subscribe((r: any) => {
                products = r.data.product;
            });

            expectOperation('GetProductById').flush({ data: { product: [] } });
            expect(products).toEqual([]);
        });
    });

    describe('getProductsByCategory', () => {
        it('queries GetProductsByCategory with the category name', () => {
            let products: unknown;
            service.getProductsByCategory('Electronics').subscribe((r: any) => {
                products = r.data.product;
            });

            const req = expectOperation('GetProductsByCategory');
            expect(req.request.body.variables).toEqual({ category: 'Electronics' });
            req.flush({ data: { product: [mockProducts[0]] } });
            expect(products).toEqual([mockProducts[0]]);
        });
    });

    describe('getProductCategories', () => {
        it('returns categories with their nested subcategories', () => {
            let categories: any[] = [];
            service.getProductCategories().subscribe((r: any) => {
                categories = r.data.category;
            });

            expectOperation('GetProductCategories').flush({
                data: { category: mockCategoriesWithSubcategories },
            });
            expect(categories.length).toBe(3);
            expect(categories[0].subcategories.length).toBe(2);
        });
    });

    describe('getSuggestedProducts', () => {
        it('returns the suggested products payload', () => {
            let firstId: number | undefined;
            service.getSuggestedProducts().subscribe((r: any) => {
                firstId = r.data.product[0].id;
            });

            expectOperation('GetSuggestedProducts').flush({ data: { product: [mockProduct] } });
            expect(firstId).toBe(mockProduct.id);
        });
    });

    describe('error handling', () => {
        it('surfaces a network error to the subscriber and evicts the failed request from cache', () => {
            let receivedError: unknown;
            service.getProductById(1).subscribe({
                error: (err) => {
                    receivedError = err;
                },
            });

            expectOperation('GetProductById').error(new ProgressEvent('error'));
            expect(receivedError).toBeTruthy();

            let retriedId: number | undefined;
            service.getProductById(1).subscribe((r: any) => {
                retriedId = r.data.product[0].id;
            });
            expectOperation('GetProductById').flush({ data: { product: [mockProducts[0]] } });
            expect(retriedId).toBe(mockProducts[0].id);
        });

        it('surfaces GraphQL errors to the subscriber when no data is returned', () => {
            let receivedError: Error | undefined;
            service.getSuggestedProducts().subscribe({
                error: (err) => {
                    receivedError = err;
                },
            });

            expectOperation('GetSuggestedProducts').flush({
                errors: [{ message: 'field "product" not found' }],
            });
            expect(receivedError?.message).toBe('field "product" not found');
        });
    });
});
