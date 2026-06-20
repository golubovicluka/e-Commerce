import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { HomeComponent } from './home.component';
import { ProductsService } from '../products/products.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { mockProducts } from 'src/app/testing/mock-data';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let products: jasmine.SpyObj<ProductsService>;
  let images: jasmine.SpyObj<ProductImageService>;
  let router: jasmine.SpyObj<Router>;
  let messages: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    products = jasmine.createSpyObj('ProductsService', ['getSuggestedProducts', 'getProductsByIds']);
    products.getSuggestedProducts.and.returnValue(
      of({ data: { product: [mockProducts[0]] } }) as any
    );
    products.getProductsByIds.and.returnValue(
      of({ data: { product: [mockProducts[0], mockProducts[1]] } }) as any
    );
    images = jasmine.createSpyObj('ProductImageService', [
      'normalizeImages',
      'resolvePrimaryImage',
      'getFallbackImageByName',
      'handleImageError',
    ]);
    images.normalizeImages.and.returnValue(['normalized.jpg', 'fallback.jpg']);
    images.resolvePrimaryImage.and.returnValue('featured.jpg');
    images.getFallbackImageByName.and.returnValue('data:image/svg+xml,fallback');
    router = jasmine.createSpyObj('Router', ['navigate']);
    messages = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        { provide: ProductsService, useValue: products },
        { provide: ProductImageService, useValue: images },
        { provide: Router, useValue: router },
        { provide: MessageService, useValue: messages },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit maps suggested products through ProductImageService.normalizeImages', () => {
    expect(component.suggestedProducts.length).toBe(1);
    expect(component.suggestedProducts[0].images).toEqual(['normalized.jpg', 'fallback.jpg']);
    expect(images.normalizeImages).toHaveBeenCalled();
  });

  it('ngOnInit loads featured product images from the catalog', () => {
    expect(products.getProductsByIds).toHaveBeenCalledWith([1, 13, 4]);
    expect(images.resolvePrimaryImage).toHaveBeenCalled();
    expect(component.macbookImg).toBe('featured.jpg');
  });

  it('redirect navigates to the product details route', () => {
    component.redirect(4);
    expect(router.navigate).toHaveBeenCalledWith(['/product', 4]);
  });

  it('submitForm rejects invalid email addresses', () => {
    component.newsletterEmail = 'not-an-email';
    component.submitForm();
    expect(messages.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'warn' }));
  });

  it('submitForm accepts a valid email address', () => {
    component.newsletterEmail = 'shopper@example.com';
    component.submitForm();
    expect(messages.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
    expect(component.newsletterEmail).toBe('');
    expect(component.newsletterSubmitted).toBe(true);
  });
});
