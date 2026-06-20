import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductImageService {
  private readonly fallbackAssetPath = 'assets/images/product-placeholder.png';
  private readonly maxProductImages = 2;

  private readonly categoryImages: Record<string, string> = {
    Home: 'https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923__480.jpg',
    Electronics: 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    'Sports & Outdoors': 'https://images.pexels.com/photos/1461883/pexels-photo-1461883.jpeg?auto=compress&cs=tinysrgb&w=500',
    Kitchen: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=500',
  };

  getFallbackImageByName(productName?: string | null): string {
    const trimmedName = productName?.trim();
    const text = trimmedName && trimmedName.length > 0 ? trimmedName : 'Product';
    return this.buildSvgPlaceholder(text, 'Shoply');
  }

  getCategoryImage(categoryName: string): string {
    const mapped = this.categoryImages[categoryName];
    if (mapped) {
      return mapped;
    }
    return this.buildSvgPlaceholder(categoryName, 'Category');
  }

  getFallbackAssetPath(): string {
    return this.fallbackAssetPath;
  }

  normalizeImages(images: string[] | null | undefined, productName?: string | null): string[] {
    const validImages = (images ?? [])
      .map((image) => image?.trim())
      .filter((image): image is string => Boolean(image));

    const limitedImages = validImages.slice(0, this.maxProductImages);

    if (limitedImages.length >= this.maxProductImages) {
      return limitedImages;
    }

    if (limitedImages.length === 1) {
      return [limitedImages[0], this.getFallbackImageByName(productName)];
    }

    const fallback = this.getFallbackImageByName(productName);
    return [fallback, this.getFallbackAssetPath()];
  }

  resolvePrimaryImage(images: string[] | null | undefined, productName?: string | null): string {
    return this.normalizeImages(images, productName)[0];
  }

  handleImageError(event: Event, productName?: string | null): void {
    const imageElement = event.target as HTMLImageElement | null;
    if (!imageElement) {
      return;
    }

    const nameBasedFallback = this.getFallbackImageByName(productName);
    const fallbackAsset = this.getFallbackAssetPath();
    const currentImageUrl = imageElement.currentSrc || imageElement.src || '';
    const isSvgFallback = currentImageUrl.startsWith('data:image/svg+xml');
    const isAssetFallback = currentImageUrl.includes(this.fallbackAssetPath);

    if (!isSvgFallback && !isAssetFallback) {
      imageElement.src = nameBasedFallback;
      return;
    }

    if (isSvgFallback) {
      imageElement.src = fallbackAsset;
    }
  }

  private buildSvgPlaceholder(label: string, kicker: string): string {
    const hue = this.hashString(label) % 360;
    const bg1 = `hsl(${hue}, 38%, 92%)`;
    const bg2 = `hsl(${(hue + 28) % 360}, 48%, 78%)`;
    const accent = `hsl(${hue}, 62%, 42%)`;
    const initials = this.getInitials(label);
    const displayText = this.truncate(label, 32);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" role="img" aria-label="${this.escapeXml(label)}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(#bg)"/>
      <circle cx="300" cy="228" r="96" fill="${accent}" opacity="0.12"/>
      <text x="300" y="248" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="80" font-weight="700" fill="${accent}">${this.escapeXml(initials)}</text>
      <text x="300" y="360" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="20" font-weight="600" fill="#2a231c">${this.escapeXml(displayText)}</text>
      <text x="300" y="392" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="14" font-weight="500" fill="#6b5f54" letter-spacing="0.12em">${this.escapeXml(kicker.toUpperCase())}</text>
    </svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  private hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private getInitials(label: string): string {
    const words = label.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      return 'P';
    }
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  private truncate(value: string, maxLength: number): string {
    return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
