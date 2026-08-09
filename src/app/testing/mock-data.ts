import { Product, Category, Subcategory } from '../features/products/Product';

/**
 * Mock data for testing
 */

export const mockCategories: Category[] = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Clothing' },
  { id: 3, name: 'Home & Garden' }
];

export const mockSubcategories: Subcategory[] = [
  { id: 1, name: 'Smartphones' },
  { id: 2, name: 'Laptops' },
  { id: 3, name: 'T-Shirts' },
  { id: 4, name: 'Jeans' },
  { id: 5, name: 'Furniture' },
  { id: 6, name: 'Tools' }
];

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'iPhone 13 Pro',
    description: 'Latest Apple smartphone with A15 Bionic chip',
    categoryId: 1,
    subcategoryId: 1,
    category: { id: 1, name: 'Electronics' },
    subcategory: { id: 1, name: 'Smartphones' },
    price: 999.99,
    EAN: 1234567890123,
    inStock: 50,
    images: ['iphone13pro.jpg']
  },
  {
    id: 2,
    name: 'MacBook Pro 16"',
    description: 'Powerful laptop for professionals',
    categoryId: 1,
    subcategoryId: 2,
    category: { id: 1, name: 'Electronics' },
    subcategory: { id: 2, name: 'Laptops' },
    price: 2499.99,
    EAN: 1234567890124,
    inStock: 25,
    images: ['macbookpro.jpg']
  },
  {
    id: 3,
    name: 'Cotton T-Shirt',
    description: 'Comfortable cotton t-shirt',
    categoryId: 2,
    subcategoryId: 3,
    category: { id: 2, name: 'Clothing' },
    subcategory: { id: 3, name: 'T-Shirts' },
    price: 19.99,
    EAN: 1234567890125,
    inStock: 100,
    images: ['tshirt.jpg']
  },
  {
    id: 4,
    name: 'Designer Jeans',
    description: 'Premium denim jeans',
    categoryId: 2,
    subcategoryId: 4,
    category: { id: 2, name: 'Clothing' },
    subcategory: { id: 4, name: 'Jeans' },
    price: 79.99,
    EAN: 1234567890126,
    inStock: 75,
    images: ['jeans.jpg']
  },
  {
    id: 5,
    name: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    categoryId: 3,
    subcategoryId: 5,
    category: { id: 3, name: 'Home & Garden' },
    subcategory: { id: 5, name: 'Furniture' },
    price: 299.99,
    EAN: 1234567890127,
    inStock: 30,
    images: ['chair.jpg']
  }
];

export const mockProduct: Product = mockProducts[0];

export const mockCategoriesWithSubcategories = [
  {
    id: 1,
    name: 'Electronics',
    subcategories: [
      { id: 1, name: 'Smartphones', categoryId: 1 },
      { id: 2, name: 'Laptops', categoryId: 1 }
    ]
  },
  {
    id: 2,
    name: 'Clothing',
    subcategories: [
      { id: 3, name: 'T-Shirts', categoryId: 2 },
      { id: 4, name: 'Jeans', categoryId: 2 }
    ]
  },
  {
    id: 3,
    name: 'Home & Garden',
    subcategories: [
      { id: 5, name: 'Furniture', categoryId: 3 },
      { id: 6, name: 'Tools', categoryId: 3 }
    ]
  }
];

/**
 * Create a mock product with custom properties
 */
export function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    ...mockProduct,
    ...overrides
  };
}

/**
 * Create multiple mock products
 */
export function createMockProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => ({
    ...mockProduct,
    id: i + 1,
    name: `Product ${i + 1}`,
    price: (i + 1) * 10
  }));
}
