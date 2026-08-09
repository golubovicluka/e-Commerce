import { createMockProduct } from '../../testing/mock-data';
import { isProduct, parseStoredProducts } from './Product';

describe('Product runtime validation', () => {
  it('accepts the required product fields', () => {
    expect(isProduct(createMockProduct())).toBe(true);
  });

  it.each([
    null,
    undefined,
    'product',
    {},
    { id: '1', name: 'Phone', price: 10 },
    { id: 1, name: 99, price: 10 },
    { id: 1, name: 'Phone', price: '10' },
    createMockProduct({ id: 0 }),
    createMockProduct({ name: '   ' }),
    createMockProduct({ description: undefined as unknown as string }),
    createMockProduct({ categoryId: -1 }),
    createMockProduct({ subcategoryId: 1.5 }),
    createMockProduct({ category: { id: 0, name: 'Invalid' } }),
    createMockProduct({ subcategory: { id: 1, name: 42 as unknown as string } }),
    createMockProduct({ price: Number.NaN }),
    createMockProduct({ EAN: 0 }),
    createMockProduct({ inStock: -1 }),
    createMockProduct({ images: ['valid.jpg', 42 as unknown as string] }),
  ])('rejects invalid product data: %p', (value) => {
    expect(isProduct(value)).toBe(false);
  });

  it('parses arrays and discards invalid entries', () => {
    const product = createMockProduct();
    expect(parseStoredProducts(JSON.stringify([product, null, { id: 1 }]))).toEqual([product]);
  });

  it('returns an empty list for absent or non-array storage data', () => {
    expect(parseStoredProducts(null)).toEqual([]);
    expect(parseStoredProducts('')).toEqual([]);
    expect(parseStoredProducts(JSON.stringify({ id: 1 }))).toEqual([]);
    expect(parseStoredProducts('{broken-json')).toEqual([]);
  });
});
