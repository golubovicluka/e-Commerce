import { TestBed } from '@angular/core/testing';
import { ApolloTestingModule, ApolloTestingController } from 'apollo-angular/testing';
import { ProductsService } from './products.service';
import { Product } from './Product';
import { mockProducts, mockProduct, mockCategoriesWithSubcategories } from '../../testing/mock-data';

/**
 * Apollo's test cache adds `__typename` to every selection, so a flushed payload
 * must carry `__typename` or the cache returns hollow ({}) objects on read.
 * This annotates a fixture (and its nested entities) for flushing; Apollo strips
 * `__typename` again on read, so the emitted value still deep-equals the fixture.
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
 * version of this spec replaced Apollo with a hand-rolled `watchQuery` spy. That
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
    it('emits the category on the categoryFilter stream', (done) => {
      service.categoryFilter.subscribe((value) => {
        expect(value).toBe('Electronics');
        done();
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

  describe('getProducts (query selection by arguments)', () => {
    it('uses GetProducts with category + sortBy when both are provided', (done) => {
      service.getProducts('desc', 'Electronics').subscribe((r: any) => {
        expect(r.data.product).toEqual([mockProducts[0]]);
        done();
      });

      const op = controller.expectOne('GetProducts');
      expect(op.operation.variables).toEqual({ category: 'Electronics', sortBy: 'desc' });
      op.flushData({ product: [asGql(mockProducts[0])] });
    });

    it('uses GetProductsByCategory when only a category is provided', (done) => {
      service.getProducts(undefined, 'Electronics').subscribe(() => done());

      const op = controller.expectOne('GetProductsByCategory');
      expect(op.operation.variables).toEqual({ category: 'Electronics' });
      op.flushData({ product: [] });
    });

    it('uses GetProductsSorted when only sortBy is provided', (done) => {
      service.getProducts('asc').subscribe(() => done());

      const op = controller.expectOne('GetProductsSorted');
      expect(op.operation.variables).toEqual({ sortBy: 'asc' });
      op.flushData({ product: mockProducts });
    });

    it('falls back to GetProductsDefault when no arguments are provided', (done) => {
      service.getProducts().subscribe(() => done());

      const op = controller.expectOne('GetProductsDefault');
      expect(op.operation.variables).toEqual({});
      op.flushData({ product: mockProducts });
    });
  });

  describe('getProductsByPrice', () => {
    it('sends the price bounds and returns the matching products', (done) => {
      service.getProductsByPrice(10, 50).subscribe((r: any) => {
        expect(r.data.product).toEqual([mockProducts[2]]);
        done();
      });

      const op = controller.expectOne('GetProductsByPrice');
      expect(op.operation.variables).toEqual({ priceFrom: 10, priceTo: 50 });
      op.flushData({ product: [asGql(mockProducts[2])] });
    });

    it('preserves a lower bound of 0 (no falsy coercion)', (done) => {
      service.getProductsByPrice(0, 5000).subscribe(() => done());

      const op = controller.expectOne('GetProductsByPrice');
      expect(op.operation.variables['priceFrom']).toBe(0);
      op.flushData({ product: mockProducts });
    });
  });

  describe('searchProducts', () => {
    it('wraps the search term in SQL wildcards for _ilike', (done) => {
      service.searchProducts('iPhone').subscribe(() => done());

      const op = controller.expectOne('SearchProducts');
      expect(op.operation.variables).toEqual({ searchInput: '%iPhone%' });
      op.flushData({ product: [mockProducts[0]] });
    });

    it('still wildcard-wraps an empty search term', (done) => {
      service.searchProducts('').subscribe(() => done());

      const op = controller.expectOne('SearchProducts');
      expect(op.operation.variables['searchInput']).toBe('%%');
      op.flushData({ product: [] });
    });
  });

  describe('getProductById', () => {
    it('sends the id and returns the product', (done) => {
      service.getProductById(5).subscribe((r: any) => {
        expect(r.data.product[0].id).toBe(5);
        done();
      });

      const op = controller.expectOne('GetProductById');
      expect(op.operation.variables).toEqual({ id: 5 });
      op.flushData({ product: [asGql(mockProducts[4])] });
    });

    it('returns an empty list for a non-existent id', (done) => {
      service.getProductById(999).subscribe((r: any) => {
        expect(r.data.product).toEqual([]);
        done();
      });

      controller.expectOne('GetProductById').flushData({ product: [] });
    });
  });

  describe('getFilteredProducts', () => {
    it('queries GetFilteredProducts with the subcategory list', (done) => {
      service.getFilteredProducts(['Smartphones', 'Laptops']).subscribe(() => done());

      const op = controller.expectOne('GetFilteredProducts');
      expect(op.operation.variables).toEqual({ filter: ['Smartphones', 'Laptops'] });
      op.flushData({ product: [mockProducts[0], mockProducts[1]] });
    });

    it('short-circuits to GetProductsDefault for an empty filter (no needless filtered query)', (done) => {
      service.getFilteredProducts([]).subscribe(() => done());

      controller.expectNone('GetFilteredProducts');
      controller.expectOne('GetProductsDefault').flushData({ product: mockProducts });
    });
  });

  describe('getProductCategories', () => {
    it('returns categories with their nested subcategories', (done) => {
      service.getProductCategories().subscribe((r: any) => {
        expect(r.data.category.length).toBe(3);
        expect(r.data.category[0].subcategories.length).toBe(2);
        done();
      });

      controller
        .expectOne('GetProductCategories')
        .flushData({ category: mockCategoriesWithSubcategories });
    });
  });

  describe('getSuggestedProducts', () => {
    it('returns the suggested products payload', (done) => {
      service.getSuggestedProducts().subscribe((r: any) => {
        expect(r.data.product[0].id).toBe(mockProduct.id);
        done();
      });

      controller.expectOne('GetSuggestedProducts').flushData({ product: [asGql(mockProduct)] });
    });
  });

  describe('legacy aliases', () => {
    it('getProductBySubcategory delegates to the category query', (done) => {
      service.getProductBySubcategory('Clothing').subscribe(() => done());

      const op = controller.expectOne('GetProductsByCategory');
      expect(op.operation.variables).toEqual({ category: 'Clothing' });
      op.flushData({ product: [] });
    });

    it('getProductsFromSubcategories delegates to the filtered query', (done) => {
      service.getProductsFromSubcategories(['Jeans']).subscribe(() => done());

      const op = controller.expectOne('GetFilteredProducts');
      expect(op.operation.variables).toEqual({ filter: ['Jeans'] });
      op.flushData({ product: [] });
    });
  });

  describe('error handling (the path the old happy-only suite never covered)', () => {
    it('surfaces a network error to the subscriber instead of swallowing it', (done) => {
      service.getProductById(1).subscribe({
        next: () => fail('expected the stream to error, not emit'),
        error: (err) => {
          expect(err).toBeTruthy();
          done();
        },
      });

      controller.expectOne('GetProductById').networkError(new Error('Network failure'));
    });

    it('surfaces GraphQL errors to the subscriber', (done) => {
      service.getProductsDefault().subscribe({
        next: () => fail('expected the stream to error, not emit'),
        error: (err) => {
          expect(err).toBeTruthy();
          done();
        },
      });

      controller
        .expectOne('GetProductsDefault')
        .graphqlErrors([{ message: 'field "product" not found' } as any]);
    });
  });
});
