import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CartItemComponent } from './cart-item.component';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { createMockProduct } from 'src/app/testing/mock-data';

/**
 * The CLI stub failed at `detectChanges()` (NG0304: `p-button` unknown). It also
 * never set the required `product` @Input, so the template would have dereferenced
 * undefined. Here we mock ProductImageService, set a product, suppress the
 * template with NO_ERRORS_SCHEMA, and cover the quantity/remove logic that drives
 * the running cart total.
 */
describe('CartItemComponent', () => {
  let component: CartItemComponent;
  let fixture: ComponentFixture<CartItemComponent>;
  let images: jasmine.SpyObj<ProductImageService>;

  beforeEach(async () => {
    images = jasmine.createSpyObj('ProductImageService', [
      'resolvePrimaryImage',
      'handleImageError',
    ]);
    images.resolvePrimaryImage.and.returnValue('img.jpg');

    await TestBed.configureTestingModule({
      declarations: [CartItemComponent],
      providers: [{ provide: ProductImageService, useValue: images }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CartItemComponent);
    component = fixture.componentInstance;
    component.product = createMockProduct({ id: 1, price: 100, inStock: 5 });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('increments quantity (up to stock) and reports the price delta', () => {
    const totalSpy = spyOn(component.updateCartTotal, 'emit');
    component.incrementProductCount(5);
    expect(component.pieces).toBe(2);
    expect(totalSpy).toHaveBeenCalledWith(100);
  });

  it('does not increment beyond available stock', () => {
    component.pieces = 5;
    const totalSpy = spyOn(component.updateCartTotal, 'emit');
    component.incrementProductCount(5);
    expect(component.pieces).toBe(5);
    expect(totalSpy).not.toHaveBeenCalled();
  });

  it('decrements quantity and reports the negative delta', () => {
    component.pieces = 3;
    const totalSpy = spyOn(component.updateCartTotal, 'emit');
    component.decrementProductCount();
    expect(component.pieces).toBe(2);
    expect(totalSpy).toHaveBeenCalledWith(-100);
  });

  it('never decrements below 1', () => {
    component.pieces = 1;
    const totalSpy = spyOn(component.updateCartTotal, 'emit');
    component.decrementProductCount();
    expect(component.pieces).toBe(1);
    expect(totalSpy).not.toHaveBeenCalled();
  });

  it('removeItem emits removeFromCart and subtracts the full line total', () => {
    component.pieces = 3;
    const removeSpy = spyOn(component.removeFromCart, 'emit');
    const totalSpy = spyOn(component.updateCartTotal, 'emit');

    component.removeItem(component.product);

    expect(removeSpy).toHaveBeenCalledOnceWith(component.product);
    expect(totalSpy).toHaveBeenCalledWith(-300); // price 100 * 3 pieces
  });

  it('getProductImage delegates to ProductImageService', () => {
    expect(component.getProductImage(component.product)).toBe('img.jpg');
    expect(images.resolvePrimaryImage).toHaveBeenCalledWith(
      component.product.images,
      component.product.name
    );
  });
});
