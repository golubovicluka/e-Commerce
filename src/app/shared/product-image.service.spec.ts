import { TestBed } from '@angular/core/testing';
import { ProductImageService } from './product-image.service';

/**
 * Unit tests for ProductImageService.
 *
 * Before this suite the service had ZERO coverage even though it contains the
 * only non-trivial branching logic in `src/app/shared` (image normalization and
 * the multi-step <img> error fallback chain). The tests below exercise every
 * branch and the edge cases that production data actually hits: null/undefined
 * image arrays, whitespace-only entries, more images than the cap, and each
 * stage of the error-fallback state machine.
 */
describe('ProductImageService', () => {
  let service: ProductImageService;
  const ASSET_FALLBACK = 'assets/images/product-placeholder.png';
  const NAME_FALLBACK_PREFIX = 'https://placehold.co/600x600/png?text=';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ProductImageService] });
    service = TestBed.inject(ProductImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFallbackImageByName', () => {
    it('encodes the product name into the placeholder URL', () => {
      expect(service.getFallbackImageByName('iPhone 13 Pro')).toBe(
        `${NAME_FALLBACK_PREFIX}${encodeURIComponent('iPhone 13 Pro')}`
      );
    });

    it('URL-encodes names with reserved characters (no broken URLs)', () => {
      expect(service.getFallbackImageByName('Tom & Jerry / 50% off?')).toBe(
        `${NAME_FALLBACK_PREFIX}${encodeURIComponent('Tom & Jerry / 50% off?')}`
      );
    });

    it('falls back to "Product Image" for null, undefined, empty and whitespace', () => {
      const expected = `${NAME_FALLBACK_PREFIX}${encodeURIComponent('Product Image')}`;
      expect(service.getFallbackImageByName(null)).toBe(expected);
      expect(service.getFallbackImageByName(undefined)).toBe(expected);
      expect(service.getFallbackImageByName('')).toBe(expected);
      expect(service.getFallbackImageByName('   ')).toBe(expected);
    });
  });

  describe('normalizeImages', () => {
    it('returns the first two images untouched when two or more are valid', () => {
      expect(service.normalizeImages(['a.jpg', 'b.jpg', 'c.jpg'], 'Phone')).toEqual([
        'a.jpg',
        'b.jpg',
      ]);
    });

    it('pads a single valid image with a name-based placeholder', () => {
      expect(service.normalizeImages(['only.jpg'], 'Chair')).toEqual([
        'only.jpg',
        service.getFallbackImageByName('Chair'),
      ]);
    });

    it('returns [name placeholder, asset placeholder] when there are no valid images', () => {
      expect(service.normalizeImages([], 'Chair')).toEqual([
        service.getFallbackImageByName('Chair'),
        ASSET_FALLBACK,
      ]);
    });

    it('treats null/undefined image arrays as empty (no crash on bad API data)', () => {
      const expected = [service.getFallbackImageByName('Chair'), ASSET_FALLBACK];
      expect(service.normalizeImages(null, 'Chair')).toEqual(expected);
      expect(service.normalizeImages(undefined, 'Chair')).toEqual(expected);
    });

    it('trims entries and drops whitespace-only / falsy entries before counting', () => {
      // After trimming, only 'real.jpg' survives -> treated as the single-image case.
      expect(
        service.normalizeImages(['   ', '', null as any, '  real.jpg  '], 'Chair')
      ).toEqual(['real.jpg', service.getFallbackImageByName('Chair')]);
    });

    it('caps the result at two images even when many valid images are supplied', () => {
      const many = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'];
      expect(service.normalizeImages(many, 'X').length).toBe(2);
    });
  });

  describe('resolvePrimaryImage', () => {
    it('returns the first valid image', () => {
      expect(service.resolvePrimaryImage(['a.jpg', 'b.jpg'], 'X')).toBe('a.jpg');
    });

    it('returns the name placeholder when no valid images exist', () => {
      expect(service.resolvePrimaryImage([], 'Office Chair')).toBe(
        service.getFallbackImageByName('Office Chair')
      );
    });
  });

  describe('handleImageError (fallback state machine)', () => {
    /** Minimal stub of the parts of HTMLImageElement the service reads/writes. */
    function imgStub(src: string, currentSrc = ''): HTMLImageElement {
      return { src, currentSrc } as HTMLImageElement;
    }

    it('does nothing when the event has no target', () => {
      expect(() =>
        service.handleImageError({ target: null } as unknown as Event, 'X')
      ).not.toThrow();
    });

    it('step 1: a failing real image swaps to the name-based placeholder', () => {
      const img = imgStub('https://cdn.example.com/real.jpg');
      service.handleImageError({ target: img } as unknown as Event, 'iPhone');
      expect(img.src).toBe(service.getFallbackImageByName('iPhone'));
    });

    it('step 2: a failing name placeholder swaps to the local asset placeholder', () => {
      const img = imgStub(service.getFallbackImageByName('iPhone'));
      service.handleImageError({ target: img } as unknown as Event, 'iPhone');
      expect(img.src).toBe(ASSET_FALLBACK);
    });

    it('step 3: a failing asset placeholder is left alone (no infinite loop)', () => {
      const img = imgStub(`http://localhost/${ASSET_FALLBACK}`);
      service.handleImageError({ target: img } as unknown as Event, 'iPhone');
      expect(img.src).toBe(`http://localhost/${ASSET_FALLBACK}`);
    });

    it('prefers currentSrc over src when deciding the current stage', () => {
      // currentSrc already points at the name placeholder -> advance to asset.
      const img = imgStub('whatever.jpg', service.getFallbackImageByName('iPhone'));
      service.handleImageError({ target: img } as unknown as Event, 'iPhone');
      expect(img.src).toBe(ASSET_FALLBACK);
    });
  });
});
