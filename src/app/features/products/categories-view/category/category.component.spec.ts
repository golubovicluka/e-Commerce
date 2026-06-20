import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ProductImageService } from 'src/app/shared/product-image.service';

import { CategoryComponent } from './category.component';

describe('CategoryComponent', () => {
  let component: CategoryComponent;
  let fixture: ComponentFixture<CategoryComponent>;
  let images: jasmine.SpyObj<ProductImageService>;

  beforeEach(async () => {
    images = jasmine.createSpyObj('ProductImageService', ['getCategoryImage']);
    images.getCategoryImage.and.callFake((name: string) =>
      name === 'Electronics' ? 'https://example.com/electronics.jpg' : 'data:image/svg+xml,fallback'
    );

    await TestBed.configureTestingModule({
      declarations: [CategoryComponent],
      providers: [{ provide: ProductImageService, useValue: images }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openProductsPage emits the category name', () => {
    const emitSpy = spyOn(component.applyCategoryFilter, 'emit');
    component.openProductsPage('Electronics');
    expect(emitSpy).toHaveBeenCalledOnceWith('Electronics');
  });

  it('getCategoryImage delegates to ProductImageService', () => {
    expect(component.getCategoryImage('Electronics')).toContain('http');
    expect(images.getCategoryImage).toHaveBeenCalledWith('Electronics');
  });

  it('getCategoryImage returns a fallback for unmapped categories', () => {
    expect(component.getCategoryImage('Totally Unknown Category')).toMatch(/^data:image\/svg\+xml,/);
  });
});
