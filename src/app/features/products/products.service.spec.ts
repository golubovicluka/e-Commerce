import { TestBed } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { mockCategoriesWithSubcategories, mockProducts } from '../../testing/mock-data';
import { Product } from './Product';
import { ProductsService } from './products.service';

function asGraphqlProduct(product: Product) {
  return {
    __typename: 'product',
    ...product,
    category: product.category
      ? { __typename: 'category', ...product.category }
      : product.category,
    subcategory: product.subcategory
      ? { __typename: 'subcategory', ...product.subcategory }
      : product.subcategory,
  };
}

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

  afterEach(() => controller.verify());

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('emits selected categories', () => {
    const received: string[] = [];
    service.categoryFilter.subscribe((category) => received.push(category));

    service.setCategoryFilter('Electronics');

    expect(received).toEqual(['Electronics']);
  });

  it('requests a default product page', () => {
    service.getProductsPage({ limit: 10, offset: 20 }).subscribe();

    const operation = controller.expectOne('GetProductsPage');
    expect(operation.operation.variables).toEqual({
      where: {},
      orderBy: [{ price: 'asc' }],
      limit: 10,
      offset: 20,
    });
    operation.flushData({
      product: [],
      product_aggregate: { aggregate: { count: 0 } },
    });
  });

  it('preserves explicit filters and ordering', () => {
    const where = { name: { _ilike: '%phone%' } };
    const orderBy = [{ price: 'desc' as const }];
    service.getProductsPage({ where, orderBy, limit: 5, offset: 0 }).subscribe();

    const operation = controller.expectOne('GetProductsPage');
    expect(operation.operation.variables).toEqual({ where, orderBy, limit: 5, offset: 0 });
    operation.flushData({
      product: [asGraphqlProduct(mockProducts[0])],
      product_aggregate: { aggregate: { count: 1 } },
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

  it('requests products by ids and one product by id', () => {
    service.getProductsByIds([1, 4, 13]).subscribe();
    const byIds = controller.expectOne('GetProductsByIds');
    expect(byIds.operation.variables).toEqual({ ids: [1, 4, 13] });
    byIds.flushData({ product: [] });

    service.getProductById(5).subscribe();
    const byId = controller.expectOne('GetProductById');
    expect(byId.operation.variables).toEqual({ id: 5 });
    byId.flushData({ product: [asGraphqlProduct(mockProducts[4])] });
  });

  it('requests a bounded related-products list', () => {
    service.getRelatedProducts('Electronics', 5).subscribe();
    const defaultLimit = controller.expectOne('GetRelatedProducts');
    expect(defaultLimit.operation.variables).toEqual({
      category: 'Electronics',
      excludeId: 5,
      limit: 4,
    });
    defaultLimit.flushData({ product: [] });

    service.getRelatedProducts('Home', 2, 2).subscribe();
    const explicitLimit = controller.expectOne('GetRelatedProducts');
    expect(explicitLimit.operation.variables).toEqual({
      category: 'Home',
      excludeId: 2,
      limit: 2,
    });
    explicitLimit.flushData({ product: [] });
  });

  it('requests typed categories and suggested products', () => {
    service.getProductCategories().subscribe();
    controller
      .expectOne('GetProductCategories')
      .flushData({ category: mockCategoriesWithSubcategories });

    service.getSuggestedProducts().subscribe();
    controller
      .expectOne('GetSuggestedProducts')
      .flushData({ product: [asGraphqlProduct(mockProducts[0])] });
  });

  it('surfaces Apollo errors to consumers', (done) => {
    service.getProductById(1).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        done();
      },
    });

    controller.expectOne('GetProductById').networkError(new Error('Network failure'));
  });
});
