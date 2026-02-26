import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: 'img[appFallbackImage]'
})
export class FallbackImageDirective implements AfterViewInit, OnChanges {
  @Input() appFallbackImage = 'assets/placeholder-image.svg';
  @Input() src: string | null = null;

  constructor(private readonly elementRef: ElementRef<HTMLImageElement>) {}

  ngAfterViewInit(): void {
    this.syncImageSource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] || changes['appFallbackImage']) {
      this.syncImageSource();
    }
  }

  @HostListener('error')
  onError(): void {
    this.setPlaceholder();
  }

  private syncImageSource(): void {
    const normalizedSource = (this.src ?? '').trim();

    if (!normalizedSource) {
      this.setPlaceholder();
      return;
    }

    this.elementRef.nativeElement.src = normalizedSource;
  }

  private setPlaceholder(): void {
    const imageElement = this.elementRef.nativeElement;

    if (imageElement.src.includes(this.appFallbackImage)) {
      return;
    }

    imageElement.src = this.appFallbackImage;
  }
}
