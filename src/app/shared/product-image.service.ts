import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductImageService {
  private readonly fallbackAssetPath = 'assets/images/product-placeholder.png';
  private readonly maxProductImages = 2;

  getFallbackImageByName(productName?: string | null): string {
    const trimmedName = productName?.trim();
    const text = trimmedName && trimmedName.length > 0 ? trimmedName : 'Product Image';

    return `https://placehold.co/600x600/png?text=${encodeURIComponent(text)}`;
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
    const isNameFallback = currentImageUrl.startsWith('https://placehold.co/');
    const isAssetFallback = currentImageUrl.includes(this.fallbackAssetPath);

    if (!isNameFallback && !isAssetFallback) {
      imageElement.src = nameBasedFallback;
      return;
    }

    if (isNameFallback) {
      imageElement.src = fallbackAsset;
    }
  }
}
