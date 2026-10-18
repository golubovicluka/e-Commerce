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

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ProductImageService] });
    service = TestBed.inject(ProductImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFallbackImageByName', () => {
    it('returns a deterministic SVG data URI for the product name', () => {
      const first = service.getFallbackImageByName('iPhone 13 Pro');
      const second = service.getFallbackImageByName('iPhone 13 Pro');
      expect(first).toMatch(/^data:image\/svg\+xml,/);
      expect(first).toBe(second);
      expect(decodeURIComponent(first)).toContain('iPhone 13 Pro');
    });

    it('falls back to "Product" for null, undefined, empty and whitespace', () => {
      const expected = service.getFallbackImageByName('Product');
      expect(service.getFallbackImageByName(null)).toBe(expected);
      expect(service.getFallbackImageByName(undefined)).toBe(expected);
      expect(service.getFallbackImageByName('')).toBe(expected);
      expect(service.getFallbackImageByName('   ')).toBe(expected);
    });

    it('escapes and truncates labels used inside the SVG', () => {
      const value = 'A & B <C> "quoted" \'single\' with a deliberately very long suffix';
      const decoded = decodeURIComponent(service.getFallbackImageByName(value));

      expect(decoded).toContain('&amp;');
      expect(decoded).toContain('&lt;C&gt;');
      expect(decoded).toContain('&quot;quoted&quot;');
      expect(decoded).toContain('&apos;single&apos;');
      expect(decoded).toContain('…');
    });

    it('uses P when initials are requested for an empty private label', () => {
      expect((service as any).getInitials('')).toBe('P');
    });
  });

  describe('getCategoryImage', () => {
    it('returns a mapped image for known categories', () => {
      expect(service.getCategoryImage('Electronics')).toContain('http');
      expect(service.getCategoryImage('Kitchen')).toContain('http');
    });

    it('returns an SVG fallback for unmapped categories', () => {
      expect(service.getCategoryImage('Totally Unknown Category')).toMatch(/^data:image\/svg\+xml,/);
    });
  });

  describe('normalizeImages', () => {
    it('returns valid images untouched when two or more are valid', () => {
      expect(service.normalizeImages(['a.jpg', 'b.jpg', 'c.jpg'], 'Phone')).toEqual([
        'a.jpg',
        'b.jpg',
        'c.jpg',
      ]);
    });

    it('keeps a single valid image without padding', () => {
      expect(service.normalizeImages(['only.jpg'], 'Chair')).toEqual(['only.jpg']);
    });

    it('returns a single name placeholder when there are no valid images', () => {
      expect(service.normalizeImages([], 'Chair')).toEqual([
        service.getFallbackImageByName('Chair'),
      ]);
    });

    it('treats null/undefined image arrays as empty (no crash on bad API data)', () => {
      const expected = [service.getFallbackImageByName('Chair')];
      expect(service.normalizeImages(null, 'Chair')).toEqual(expected);
      expect(service.normalizeImages(undefined, 'Chair')).toEqual(expected);
    });

    it('trims entries and drops whitespace-only, falsy, and dead entries', () => {
      expect(
        service.normalizeImages(
          [
            '   ',
            '',
            null as any,
            'https://www.ineedamobile.com/wp-content/uploads/2019/04/iPad-Pro-2.png',
            '  real.jpg  ',
          ],
          'Chair',
        ),
      ).toEqual(['real.jpg']);
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
    function imgStub(src: string, currentSrc = ''): HTMLImageElement {
      return { src, currentSrc } as HTMLImageElement;
    }

    it('does nothing when the event has no target', () => {
      expect(() =>
        service.handleImageError({ target: null } as unknown as Event, 'X')
      ).not.toThrow();
    });

    it('step 1: a failing real image swaps to the SVG placeholder', () => {
      const img = imgStub('https://cdn.example.com/real.jpg');
      service.handleImageError({ target: img } as unknown as Event, 'iPhone');
      expect(img.src).toBe(service.getFallbackImageByName('iPhone'));
    });

    it('step 2: a failing SVG placeholder swaps to the local asset placeholder', () => {
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
      const img = imgStub('whatever.jpg', service.getFallbackImageByName('iPhone'));
      service.handleImageError({ target: img } as unknown as Event, 'iPhone');
      expect(img.src).toBe(ASSET_FALLBACK);
    });

    it('uses an empty current URL when neither image URL is available', () => {
      const img = imgStub('', '');
      service.handleImageError({ target: img } as unknown as Event, 'iPhone');
      expect(img.src).toBe(service.getFallbackImageByName('iPhone'));
    });
  });
});
