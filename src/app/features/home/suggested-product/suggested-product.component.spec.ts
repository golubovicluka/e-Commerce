import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SuggestedProductComponent } from './suggested-product.component';
import { ProductImageService } from 'src/app/shared/product-image.service';

describe('SuggestedProductComponent', () => {
  let component: SuggestedProductComponent;
  let fixture: ComponentFixture<SuggestedProductComponent>;
  let images: jasmine.SpyObj<ProductImageService>;

  beforeEach(async () => {
    images = jasmine.createSpyObj('ProductImageService', [
      'resolvePrimaryImage',
      'handleImageError',
    ]);
    images.resolvePrimaryImage.and.returnValue('resolved.jpg');

    await TestBed.configureTestingModule({
      declarations: [SuggestedProductComponent],
      providers: [{ provide: ProductImageService, useValue: images }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SuggestedProductComponent);
    component = fixture.componentInstance;
    component.id = 3;
    component.name = 'iPad Pro';
    component.image = 'ipad.jpg';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openDetails emits the product id', () => {
    const emitSpy = spyOn(component.openProductDetails, 'emit');
    component.openDetails(3);
    expect(emitSpy).toHaveBeenCalledOnceWith(3);
  });

  it('resolvedImage resolves the single image through ProductImageService', () => {
    expect(component.resolvedImage).toBe('resolved.jpg');
    expect(images.resolvePrimaryImage).toHaveBeenCalledWith(['ipad.jpg'], 'iPad Pro');
  });

  it('onImageError delegates to ProductImageService', () => {
    const event = new Event('error');
    component.onImageError(event);
    expect(images.handleImageError).toHaveBeenCalledWith(event, 'iPad Pro');
  });
});
