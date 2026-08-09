import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { mockCategories } from 'src/app/testing/mock-data';
import { CategoryComponent } from './category.component';

describe('CategoryComponent', () => {
  let component: CategoryComponent;
  let fixture: ComponentFixture<CategoryComponent>;
  let images: { getCategoryImage: jest.Mock };

  beforeEach(async () => {
    images = {
      getCategoryImage: jest.fn((name: string) => `image-for-${name}`),
    };

    await TestBed.configureTestingModule({
      imports: [CategoryComponent],
      providers: [
        provideRouter([]),
        { provide: ProductImageService, useValue: images },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('category', mockCategories[0]);
    fixture.detectChanges();
  });

  it('renders a semantic link with a stable category id', () => {
    const link = fixture.nativeElement.querySelector('a.category-tile') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/products/search?categoryId=1');
    expect(link.getAttribute('aria-label')).toBe('Browse Electronics products');
    expect(link.textContent).toContain('Electronics');
  });

  it('delegates category imagery to the image service', () => {
    expect(component.getCategoryImage('Electronics')).toBe('image-for-Electronics');
    expect(images.getCategoryImage).toHaveBeenCalledWith('Electronics');
  });
});
