import { TestBed } from '@angular/core/testing';
import { ProductsService } from './products.service';
import { Apollo } from 'apollo-angular';
import { mockProducts, mockProduct, mockCategoriesWithSubcategories } from '../../testing/mock-data';
import { createMockWatchQueryResponse } from '../../testing/apollo-mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let apolloSpy: jasmine.SpyObj<Apollo>;

  beforeEach(() => {
    apolloSpy = jasmine.createSpyObj('Apollo', ['watchQuery']);

    TestBed.configureTestingModule({
      providers: [
        ProductsService,
        { provide: Apollo, useValue: apolloSpy }
      ]
    });

    service = TestBed.inject(ProductsService);
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have categoryFilter$ subject', () => {
      expect(service.categoryFilter$).toBeDefined();
    });

    it('should have categoryFilter observable', () => {
      expect(service.categoryFilter).toBeDefined();
    });
  });

  describe('setCategoryFilter', () => {
    it('should emit category filter value', (done) => {
      const category = 'Electronics';

      service.categoryFilter.subscribe(value => {
        expect(value).toBe(category);
        done();
      });

      service.setCategoryFilter(category);
    });

    it('should emit multiple category filter values', (done) => {
      const categories = ['Electronics', 'Clothing', 'Home & Garden'];
      let index = 0;

      service.categoryFilter.subscribe(value => {
        expect(value).toBe(categories[index]);
        index++;
        if (index === categories.length) {
          done();
        }
      });

      categories.forEach(cat => service.setCategoryFilter(cat));
    });
  });

  describe('getProducts', () => {
    it('should get all products without filters', () => {
      const mockResponse = { data: { product: mockProducts } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProducts();

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual(mockProducts);
      });

      expect(apolloSpy.watchQuery).toHaveBeenCalled();
    });

    it('should get products with category filter', () => {
      const mockResponse = { data: { product: [mockProducts[0]] } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProducts(undefined, 'Electronics');

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual([mockProducts[0]]);
      });

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables).toEqual({ category: 'Electronics' });
    });

    it('should get products with sortBy filter', () => {
      const mockResponse = { data: { product: mockProducts } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProducts('asc');

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual(mockProducts);
      });

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables).toEqual({ sortBy: 'asc' });
    });

    it('should get products with both category and sortBy', () => {
      const mockResponse = { data: { product: [mockProducts[0]] } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProducts('desc', 'Electronics');

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual([mockProducts[0]]);
      });

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables).toEqual({ category: 'Electronics', sortBy: 'desc' });
    });
  });

  describe('getProductsDefault', () => {
    it('should get default products list', () => {
      const mockResponse = { data: { product: mockProducts } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProductsDefault();

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual(mockProducts);
      });

      expect(apolloSpy.watchQuery).toHaveBeenCalled();
    });
  });

  describe('getProductsByPrice', () => {
    it('should get products within price range', () => {
      const filteredProducts = [mockProducts[2]];
      const mockResponse = { data: { product: filteredProducts } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProductsByPrice(10, 50);

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual(filteredProducts);
      });

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables).toEqual({ priceFrom: 10, priceTo: 50 });
    });

    it('should handle minimum price of 0', () => {
      const mockResponse = { data: { product: mockProducts } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProductsByPrice(0, 5000);

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual(mockProducts);
      });

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables?.['priceFrom']).toBe(0);
    });
  });

  describe('searchProducts', () => {
    it('should search products by name', () => {
      const searchResults = [mockProducts[0]];
      const mockResponse = { data: { product: searchResults } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.searchProducts('iPhone');

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual(searchResults);
      });

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables?.['searchInput']).toBe('%iPhone%');
    });

    it('should wrap search input with wildcards', () => {
      const mockResponse = { data: { product: [] } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      service.searchProducts('test').subscribe();

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables?.['searchInput']).toBe('%test%');
    });

    it('should handle empty search results', () => {
      const mockResponse = { data: { product: [] } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.searchProducts('nonexistent');

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual([]);
      });
    });
  });

  describe('getProductById', () => {
    it('should get product by id', () => {
      const mockResponse = { data: { product: [mockProduct] } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProductById(1);

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual([mockProduct]);
      });

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables).toEqual({ id: 1 });
    });

    it('should handle numeric id correctly', () => {
      const mockResponse = { data: { product: [mockProducts[4]] } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProductById(5);

      result$.subscribe((result: any) => {
        expect(result.data.product[0].id).toBe(5);
      });

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables?.['id']).toBe(5);
    });

    it('should return empty array for non-existent id', () => {
      const mockResponse = { data: { product: [] } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProductById(999);

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual([]);
      });
    });
  });

  describe('getProductsByCategory', () => {
    it('should get products by category', () => {
      const electronicsProducts = mockProducts.filter(p => p.categoryId === 1);
      const mockResponse = { data: { product: electronicsProducts } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProductsByCategory('Electronics');

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual(electronicsProducts);
      });

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables).toEqual({ category: 'Electronics' });
    });

    it('should handle different category names', () => {
      const clothingProducts = mockProducts.filter(p => p.categoryId === 2);
      const mockResponse = { data: { product: clothingProducts } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProductsByCategory('Clothing');

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual(clothingProducts);
      });
    });
  });

  describe('getFilteredProducts', () => {
    it('should get products filtered by subcategories', () => {
      const filtered = [mockProducts[0]];
      const mockResponse = { data: { product: filtered } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getFilteredProducts(['Smartphones']);

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual(filtered);
      });

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables).toEqual({ filter: ['Smartphones'] });
    });

    it('should get default products when filter is empty', () => {
      const mockResponse = { data: { product: mockProducts } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getFilteredProducts([]);

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual(mockProducts);
      });

      expect(apolloSpy.watchQuery).toHaveBeenCalled();
    });

    it('should handle multiple subcategory filters', () => {
      const filtered = [mockProducts[0], mockProducts[1]];
      const mockResponse = { data: { product: filtered } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getFilteredProducts(['Smartphones', 'Laptops']);

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual(filtered);
      });

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables?.['filter']).toEqual(['Smartphones', 'Laptops']);
    });
  });

  describe('getProductCategories', () => {
    it('should get all categories with subcategories', () => {
      const mockResponse = { data: { category: mockCategoriesWithSubcategories } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProductCategories();

      result$.subscribe((result: any) => {
        expect(result.data.category).toEqual(mockCategoriesWithSubcategories);
        expect(result.data.category.length).toBe(3);
        expect(result.data.category[0].subcategories.length).toBe(2);
      });

      expect(apolloSpy.watchQuery).toHaveBeenCalled();
    });

    it('should include subcategories in categories', () => {
      const mockResponse = { data: { category: mockCategoriesWithSubcategories } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getProductCategories();

      result$.subscribe((result: any) => {
        const categories = result.data.category;
        categories.forEach((category: any) => {
          expect(category.subcategories).toBeDefined();
          expect(Array.isArray(category.subcategories)).toBe(true);
        });
      });
    });
  });

  describe('getSuggestedProducts', () => {
    it('should get limited number of suggested products', () => {
      const suggestedProducts = mockProducts.slice(0, 10);
      const mockResponse = { data: { product: suggestedProducts } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getSuggestedProducts();

      result$.subscribe((result: any) => {
        expect(result.data.product).toEqual(suggestedProducts);
        expect(result.data.product.length).toBeLessThanOrEqual(10);
      });

      expect(apolloSpy.watchQuery).toHaveBeenCalled();
    });

    it('should return products with all required fields', () => {
      const mockResponse = { data: { product: [mockProduct] } };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const result$ = service.getSuggestedProducts();

      result$.subscribe((result: any) => {
        const product = result.data.product[0];
        expect(product.id).toBeDefined();
        expect(product.name).toBeDefined();
        expect(product.price).toBeDefined();
        expect(product.images).toBeDefined();
      });
    });
  });

  describe('getProductsPage', () => {
    it('should fetch a single page with where, orderBy, limit and offset', () => {
      const mockResponse = {
        data: {
          product: mockProducts.slice(0, 2),
          product_aggregate: { aggregate: { count: mockProducts.length } }
        }
      };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const where = { category: { name: { _eq: 'Electronics' } } };
      const orderBy = [{ price: 'desc' }];
      const result$ = service.getProductsPage({ where, orderBy, limit: 10, offset: 20 });

      result$.subscribe((result: any) => {
        expect(result.data.product.length).toBe(2);
        expect(result.data.product_aggregate.aggregate.count).toBe(mockProducts.length);
      });

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables).toEqual({ where, orderBy, limit: 10, offset: 20 });
    });

    it('should default where and orderBy when not provided', () => {
      const mockResponse = {
        data: { product: [], product_aggregate: { aggregate: { count: 0 } } }
      };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      service.getProductsPage({ limit: 5, offset: 0 }).subscribe();

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables).toEqual({
        where: {},
        orderBy: [{ price: 'asc' }],
        limit: 5,
        offset: 0
      });
    });
  });

  describe('getPriceBounds', () => {
    it('should request the min/max aggregate for the given filter', () => {
      const mockResponse = {
        data: { product_aggregate: { aggregate: { min: { price: 19.99 }, max: { price: 2499.99 } } } }
      };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      const where = { category: { name: { _eq: 'Electronics' } } };
      service.getPriceBounds(where).subscribe((result: any) => {
        expect(result.data.product_aggregate.aggregate.min.price).toBe(19.99);
        expect(result.data.product_aggregate.aggregate.max.price).toBe(2499.99);
      });

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables).toEqual({ where });
    });

    it('should default to an empty filter', () => {
      const mockResponse = {
        data: { product_aggregate: { aggregate: { min: { price: 0 }, max: { price: 0 } } } }
      };
      apolloSpy.watchQuery.and.returnValue(createMockWatchQueryResponse(mockResponse) as any);

      service.getPriceBounds().subscribe();

      const call = apolloSpy.watchQuery.calls.mostRecent();
      expect(call.args[0].variables).toEqual({ where: {} });
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple service calls independently', () => {
      const mockResponse1 = { data: { product: [mockProducts[0]] } };
      const mockResponse2 = { data: { product: [mockProducts[1]] } };

      apolloSpy.watchQuery.and.returnValues(
        createMockWatchQueryResponse(mockResponse1) as any,
        createMockWatchQueryResponse(mockResponse2) as any
      );

      service.getProductById(1).subscribe((result: any) => {
        expect(result.data.product).toEqual([mockProducts[0]]);
      });

      service.getProductById(2).subscribe((result: any) => {
        expect(result.data.product).toEqual([mockProducts[1]]);
      });

      expect(apolloSpy.watchQuery).toHaveBeenCalledTimes(2);
    });

    it('should handle category filter updates', (done) => {
      const categories = ['Electronics', 'Clothing'];
      let index = 0;

      service.categoryFilter.subscribe(category => {
        expect(category).toBe(categories[index]);
        index++;
        if (index === categories.length) {
          done();
        }
      });

      categories.forEach(cat => service.setCategoryFilter(cat));
    });
  });
});
