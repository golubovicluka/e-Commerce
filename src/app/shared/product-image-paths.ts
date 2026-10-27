/**
 * Bundled image paths and pure resolution helpers.
 * The storefront never loads product or category photos from remote URLs at runtime.
 */

export const IMAGE_ASSETS = {
  productPlaceholder: 'assets/images/product-placeholder.png',
  productsRoot: 'assets/images/products',
  categoriesRoot: 'assets/images/categories',
} as const;

/** Known bad or retired remote URLs mapped to filenames under `assets/images/products/`. */
export const LEGACY_REMOTE_IMAGE_MAP: Readonly<Record<string, string>> = {
  'https://www.ineedamobile.com/wp-content/uploads/2019/04/iPad-Pro-2.png': 'ipad-pro.png',
};

/** Default category hero filenames (place files in `src/assets/images/categories/`). */
export const CATEGORY_IMAGE_FILES: Readonly<Record<string, string>> = {
  Clothing: 'clothing.jpg',
  Electronics: 'electronics.jpg',
  Home: 'home.jpg',
  'Home & Garden': 'home-and-garden.jpg',
  Kitchen: 'kitchen.jpg',
  'Sports & Outdoors': 'sports-and-outdoors.jpg',
};

const REMOTE_IMAGE_PATTERN = /^https?:\/\//i;
const IMAGE_EXTENSION_PATTERN = /\.(avif|gif|jpe?g|png|webp)$/i;

export function stripLeadingSlash(path: string): string {
  return path.replace(/^\/+/, '');
}

export function isRemoteImageReference(value: string): boolean {
  return REMOTE_IMAGE_PATTERN.test(value.trim());
}

export function isBundledAssetPath(value: string): boolean {
  return stripLeadingSlash(value.trim()).startsWith('assets/');
}

export function slugifyCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function toProductAssetPath(filename: string): string {
  const normalized = stripLeadingSlash(filename.trim());
  if (normalized.startsWith(`${IMAGE_ASSETS.productsRoot}/`)) {
    return normalized;
  }

  const basename = normalized.includes('/')
    ? normalized.split('/').pop()!
    : normalized;
  return `${IMAGE_ASSETS.productsRoot}/${basename}`;
}

export function resolveImageReference(reference: string): string | null {
  const trimmed = reference.trim();
  if (!trimmed) {
    return null;
  }

  const legacyFile = LEGACY_REMOTE_IMAGE_MAP[trimmed];
  if (legacyFile) {
    return toProductAssetPath(legacyFile);
  }

  if (isBundledAssetPath(trimmed)) {
    return stripLeadingSlash(trimmed);
  }

  if (isRemoteImageReference(trimmed)) {
    const basename = (trimmed.split('/').pop() || '').split('?')[0].trim();
    if (basename && IMAGE_EXTENSION_PATTERN.test(basename)) {
      return toProductAssetPath(basename);
    }
    return null;
  }

  return toProductAssetPath(trimmed);
}

export function categoryAssetPath(categoryName: string): string {
  const trimmed = categoryName.trim();
  const mapped = CATEGORY_IMAGE_FILES[trimmed];
  const filename = mapped ?? `${slugifyCategoryName(trimmed)}.jpg`;
  return `${IMAGE_ASSETS.categoriesRoot}/${filename}`;
}
