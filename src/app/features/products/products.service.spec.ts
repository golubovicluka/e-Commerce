import { TestBed } from '@angular/core/testing';
import { ApolloTestingModule, ApolloTestingController } from 'apollo-angular/testing';
import { ProductsService } from './products.service';
import { Product } from './Product';
import { mockProducts, mockProduct, mockCategoriesWithSubcategories } from '../../testing/mock-data';

/**
 * Apollo's test cache adds `__typename` to every selection, so a flushed payload
 * must carry `__typename` or the cache returns hollow ({}) objects on read.
 * This annotates a fixture (and its nested entities) for flushing.
 */
function asGql(product: Product) {
    return {
        __typename: 'product',
        ...product,
        category: product.category ? { __typename: 'category', ...product.category } : product.category,
        subcategory: product.subcategory
            ? { __typename: 'subcategory', ...product.subcategory }
            : product.subcategory,
    };
}

/**
 * ProductsService talks to a Hasura GraphQL backend through Apollo. The previous
 * version of this spec replaced Apollo with a hand-rolled watched-query spy. That
 * approach had three problems:
 *
 *   1. It never validated the GraphQL documents the service builds, so a broken
 *      query, a renamed variable, or a wrong operation would still "pass".
 *   2. The mock double-wrapped the payload (`{ data: { data: { product } } }`),
 *      so every `result.data.product` assertion silently compared against
 *      `undefined` — the assertions were effectively dead. (See git history:
 *      ~18 of these tests were red.)
 *   3. Subscriptions were never completed/unsubscribed, leaking a callback that
 *      threw inside `afterAll` and disconnected the Karma browser.
 *
 * This version uses ApolloTestingModule so we exercise the real Apollo links:
 * the service emits a request, we assert on the *actual* operation name and
 * variables, then flush a controlled response (or a network error). `verify()`
 * fails the test if the service issues an unexpected query. Emissions arrive
 * asynchronously, so each test uses the `done` callback.
 */
describe('ProductsService', () => {
    let service: ProductsService;
    let controller: ApolloTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ApolloTestingModule],
            providers: [ProductsService],
        });
        service = TestBed.inject(ProductsService);
        controller = TestBed.inject(ApolloTestingController);
    });

    afterEach(() => {
        // Fails if any query was issued that a test did not explicitly expect/flush.
        controller.verify();
    });

    describe('Initialization', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });
    });

    describe('setCategoryFilter', () => {
        it('emits the category on the categoryFilter stream', async () => {
            service.categoryFilter.subscribe((value) => {
                expect(value).toBe('Electronics');
                ;
            });
            service.setCategoryFilter('Electronics');
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

            const op = controller.expectOne('GetProductsPage');
            expect(op.operation.variables).toEqual({
                where: {},
                orderBy: [{ price: 'asc' }],
                limit: 10,
                offset: 20,
            });
            op.flushData({
                product: [],
                product_aggregate: { aggregate: { count: 0 } },
            });
        });

        it('requests a page with explicit where and orderBy expressions', () => {
            const where = { name: { _ilike: '%phone%' } };
            const orderBy = [{ price: 'desc' }];
            service.getProductsPage({ where, orderBy, limit: 5, offset: 0 }).subscribe();

            const op = controller.expectOne('GetProductsPage');
            expect(op.operation.variables).toEqual({ where, orderBy, limit: 5, offset: 0 });
            op.flushData({
                product: [],
                product_aggregate: { aggregate: { count: 0 } },
            });
        });

        it('requests global and filtered price bounds', () => {
            service.getPriceBounds().subscribe();
            const global = controller.expectOne('GetPriceBounds');
            expect(global.operation.variables).toEqual({ where: {} });
            global.flushData({ product_aggregate: { aggregate: { min: null, max: null } } });

            const where = { category: { name: { _eq: 'Electronics' } } };
            service.getPriceBounds(where).subscribe();
            const filtered = controller.expectOne('GetPriceBounds');
            expect(filtered.operation.variables).toEqual({ where });
            filtered.flushData({ product_aggregate: { aggregate: { min: null, max: null } } });
        });

        it('requests products by id list', () => {
            service.getProductsByIds([1, 4, 13]).subscribe();

            const op = controller.expectOne('GetProductsByIds');
            expect(op.operation.variables).toEqual({ ids: [1, 4, 13] });
            op.flushData({ product: [] });
        });
    });

    describe('getProductById', () => {
        it('sends the id and returns the product', async () => {
            service.getProductById(5).subscribe((r: any) => {
                expect(r.data.product[0].id).toBe(5);
            });

            const op = controller.expectOne('GetProductById');
            expect(op.operation.variables).toEqual({ id: 5 });
            op.flushData({ product: [asGql(mockProducts[4])] });
        });

        it('returns an empty list for a non-existent id', async () => {
            service.getProductById(999).subscribe((r: any) => {
                expect(r.data.product).toEqual([]);
            });

            controller.expectOne('GetProductById').flushData({ product: [] });
        });
    });

    describe('getProductsByCategory', () => {
        it('queries GetProductsByCategory with the category name', () => {
            service.getProductsByCategory('Electronics').subscribe((r: any) => {
                expect(r.data.product).toMatchObject([mockProducts[0]]);
            });

            const op = controller.expectOne('GetProductsByCategory');
            expect(op.operation.variables).toEqual({ category: 'Electronics' });
            op.flushData({ product: [asGql(mockProducts[0])] });
        });
    });

    describe('getProductCategories', () => {
        it('returns categories with their nested subcategories', async () => {
            service.getProductCategories().subscribe((r: any) => {
                expect(r.data.category.length).toBe(3);
                expect(r.data.category[0].subcategories.length).toBe(2);
            });

            controller
                .expectOne('GetProductCategories')
                .flushData({ category: mockCategoriesWithSubcategories });
        });
    });

    describe('getSuggestedProducts', () => {
        it('returns the suggested products payload', async () => {
            service.getSuggestedProducts().subscribe((r: any) => {
                expect(r.data.product[0].id).toBe(mockProduct.id);
            });

            controller.expectOne('GetSuggestedProducts').flushData({ product: [asGql(mockProduct)] });
        });
    });

    describe('error handling (the path the old happy-only suite never covered)', () => {
        it('surfaces a network error to the subscriber instead of swallowing it', async () => {
            service.getProductById(1).subscribe({
                next: () => {
                    throw new Error('expected the stream to error, not emit');
                },
                error: (err) => {
                    expect(err).toBeTruthy();
                },
            });

            controller.expectOne('GetProductById').networkError(new Error('Network failure'));
        });

        it('surfaces GraphQL errors to the subscriber', async () => {
            service.getSuggestedProducts().subscribe({
                next: () => {
                    throw new Error('expected the stream to error, not emit');
                },
                error: (err) => {
                    expect(err).toBeTruthy();
                },
            });

            controller
                .expectOne('GetSuggestedProducts')
                .graphqlErrors([{ message: 'field "product" not found' } as any]);
        });
    });
});
