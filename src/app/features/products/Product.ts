export interface Product {
  id: number
  name: string
  description: string
  categoryId: number
  subcategoryId: number
  category?: Category | undefined
  subcategory?: Subcategory | undefined
  price: number
  EAN: number
  inStock: number
  images: string[]
}

export interface ProductDTO {
  data: {
    product: Product[]
  }
}

export interface Category {
  id: number
  name: string
}

export interface Subcategory {
  id: number
  name: string
}

/**
 * Runtime type guard for a Product. Used to validate untrusted data
 * (e.g. values read back from localStorage) before it is trusted by the app.
 */
export function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['id'] === 'number' &&
    typeof candidate['name'] === 'string' &&
    typeof candidate['price'] === 'number'
  );
}

/**
 * Safely parse a JSON string (e.g. from localStorage) into a Product array,
 * discarding any entries that do not match the Product shape. Returns an empty
 * array when the input is null/empty or is not a JSON array.
 */
export function parseStoredProducts(raw: string | null): Product[] {
  if (!raw) {
    return [];
  }
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.filter(isProduct);
}
