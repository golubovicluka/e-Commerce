export interface Product {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  subcategoryId: number;
  category?: Category;
  subcategory?: Subcategory;
  price: number;
  EAN: number;
  inStock: number;
  images: string[];
}

export interface Category {
  id: number;
  name: string;
}

export interface Subcategory {
  id: number;
  name: string;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPositiveInteger(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isSafeInteger(value) && value > 0;
}

function isCategory(value: unknown): value is Category {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return isPositiveInteger(candidate['id']) && typeof candidate['name'] === 'string';
}

function isOptionalCategory(value: unknown): value is Category | undefined {
  return value === undefined || isCategory(value);
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
    isPositiveInteger(candidate['id']) &&
    typeof candidate['name'] === 'string' &&
    candidate['name'].trim().length > 0 &&
    typeof candidate['description'] === 'string' &&
    isPositiveInteger(candidate['categoryId']) &&
    isPositiveInteger(candidate['subcategoryId']) &&
    isOptionalCategory(candidate['category']) &&
    isOptionalCategory(candidate['subcategory']) &&
    isFiniteNumber(candidate['price']) &&
    candidate['price'] >= 0 &&
    isPositiveInteger(candidate['EAN']) &&
    isFiniteNumber(candidate['inStock']) &&
    Number.isSafeInteger(candidate['inStock']) &&
    candidate['inStock'] >= 0 &&
    Array.isArray(candidate['images']) &&
    candidate['images'].every((image) => typeof image === 'string')
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

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isProduct);
  } catch {
    return [];
  }
}
