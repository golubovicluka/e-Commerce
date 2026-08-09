import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { createMockProduct } from 'src/app/testing/mock-data';
import { SuggestedProductComponent } from './suggested-product.component';

describe('SuggestedProductComponent', () => {
  let component: SuggestedProductComponent;
  let fixture: ComponentFixture<SuggestedProductComponent>;
  let images: { resolvePrimaryImage: jest.Mock; handleImageError: jest.Mock };
  const product = createMockProduct({
    id: 3,
    name: 'iPad Pro',
    images: ['ipad.jpg'],
  });

  beforeEach(async () => {
    images = {
      resolvePrimaryImage: jest.fn(() => 'resolved.jpg'),
      handleImageError: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SuggestedProductComponent],
      providers: [
        provideRouter([]),
        { provide: ProductImageService, useValue: images },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SuggestedProductComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
  });

  it('renders a semantic product-details link', () => {
    const link = fixture.nativeElement.querySelector('a.suggested-card') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/product/3');
    expect(link.getAttribute('aria-label')).toContain('iPad Pro');
  });

  it('resolves product imagery through the image service', () => {
    expect(component.resolvedImage()).toBe('resolved.jpg');
    expect(images.resolvePrimaryImage).toHaveBeenCalledWith(['ipad.jpg'], 'iPad Pro');
  });

  it('delegates image failures to the image service', () => {
    const event = new Event('error');
    component.onImageError(event);
    expect(images.handleImageError).toHaveBeenCalledWith(event, 'iPad Pro');
  });
});
