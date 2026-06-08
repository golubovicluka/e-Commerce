import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { HomeComponent } from './home.component';
import { ProductsService } from '../products/products.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { mockProducts } from 'src/app/testing/mock-data';

/**
 * The CLI stub threw `No provider for Apollo!` via ProductsService. With doubles
 * for ProductsService / ProductImageService / Router we cover ngOnInit's
 * suggested-products mapping and the redirect helper.
 */
describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let products: jasmine.SpyObj<ProductsService>;
  let images: jasmine.SpyObj<ProductImageService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    products = jasmine.createSpyObj('ProductsService', ['getSuggestedProducts']);
    products.getSuggestedProducts.and.returnValue(
      of({ data: { product: [mockProducts[0]] } }) as any
    );
    images = jasmine.createSpyObj('ProductImageService', ['normalizeImages']);
    images.normalizeImages.and.returnValue(['normalized.jpg', 'fallback.jpg']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        { provide: ProductsService, useValue: products },
        { provide: ProductImageService, useValue: images },
        { provide: Router, useValue: router },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    // Initialise so the `suggestedProductsSubscription` exists; otherwise the
    // component's ngOnDestroy throws on `undefined.unsubscribe()` during teardown.
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

  it('redirect navigates to the product details route', () => {
    component.redirect(4);
    expect(router.navigate).toHaveBeenCalledWith(['/product', 4]);
  });
});
