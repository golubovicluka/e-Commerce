import {
  IMAGE_ASSETS,
  categoryAssetPath,
  isBundledAssetPath,
  isRemoteImageReference,
  resolveImageReference,
  slugifyCategoryName,
  toProductAssetPath,
} from './product-image-paths';

describe('product-image-paths', () => {
  describe('resolveImageReference', () => {
    it('maps bare filenames into the products asset folder', () => {
      expect(resolveImageReference('iphone13pro.jpg')).toBe(
        'assets/images/products/iphone13pro.jpg',
      );
    });

    it('keeps bundled asset paths and strips a leading slash', () => {
      expect(resolveImageReference('/assets/images/product-placeholder.png')).toBe(
        IMAGE_ASSETS.productPlaceholder,
      );
    });

    it('maps legacy remote URLs to bundled filenames', () => {
      expect(
        resolveImageReference(
          'https://www.ineedamobile.com/wp-content/uploads/2019/04/iPad-Pro-2.png',
        ),
      ).toBe('assets/images/products/ipad-pro.png');
    });

    it('derives a local filename from other remote URLs when possible', () => {
      expect(resolveImageReference('https://cdn.example.com/catalog/phone.jpeg?w=500')).toBe(
        'assets/images/products/phone.jpeg',
      );
    });

    it('drops remote URLs that do not look like image files', () => {
      expect(resolveImageReference('https://cdn.example.com/no-extension')).toBeNull();
      expect(resolveImageReference('https://cdn.example.com/')).toBeNull();
    });

    it('drops empty and whitespace-only values', () => {
      expect(resolveImageReference('')).toBeNull();
      expect(resolveImageReference('   ')).toBeNull();
    });
  });

  describe('toProductAssetPath', () => {
    it('does not double-prefix paths already under products/', () => {
      expect(toProductAssetPath('assets/images/products/chair.jpg')).toBe(
        'assets/images/products/chair.jpg',
      );
    });

    it('uses the last segment when a nested path is provided', () => {
      expect(toProductAssetPath('imports/catalog/chair.jpg')).toBe(
        'assets/images/products/chair.jpg',
      );
    });
  });

  describe('categoryAssetPath', () => {
    it('uses the known filename for mapped categories', () => {
      expect(categoryAssetPath('Electronics')).toBe('assets/images/categories/electronics.jpg');
    });

    it('slugifies unknown category names', () => {
      expect(categoryAssetPath('Totally Unknown Category')).toBe(
        'assets/images/categories/totally-unknown-category.jpg',
      );
    });
  });

  describe('helpers', () => {
    it('detects remote and bundled references', () => {
      expect(isRemoteImageReference('https://example.com/a.jpg')).toBe(true);
      expect(isRemoteImageReference('chair.jpg')).toBe(false);
      expect(isBundledAssetPath('/assets/images/products/a.jpg')).toBe(true);
      expect(isBundledAssetPath('chair.jpg')).toBe(false);
    });

    it('slugifies category names consistently', () => {
      expect(slugifyCategoryName('Home & Garden')).toBe('home-and-garden');
    });
  });
});
