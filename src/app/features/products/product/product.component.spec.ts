import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductActionsService } from 'src/app/shared/product-actions.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { createMockProduct } from 'src/app/testing/mock-data';
import { ProductComponent } from './product.component';

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;
  let actions: {
    inCart: jest.Mock;
    inWishlist: jest.Mock;
    toggleCart: jest.Mock;
    toggleWishlist: jest.Mock;
  };
  let images: {
    normalizeImages: jest.Mock;
    resolvePrimaryImage: jest.Mock;
    handleImageError: jest.Mock;
  };

  const product = createMockProduct({
    id: 7,
    name: 'Studio laptop',
    images: ['raw.jpg'],
  });

  beforeEach(async () => {
    actions = {
      inCart: jest.fn(() => false),
      inWishlist: jest.fn(() => false),
      toggleCart: jest.fn(() => true),
      toggleWishlist: jest.fn(() => true),
    };
    images = {
      normalizeImages: jest.fn(() => ['primary.jpg', 'secondary.jpg']),
      resolvePrimaryImage: jest.fn(() => 'primary.jpg'),
      handleImageError: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductComponent],
      providers: [
        provideRouter([]),
        { provide: ProductActionsService, useValue: actions },
        { provide: ProductImageService, useValue: images },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', product);
    fixture.autoDetectChanges();
  });

  it('normalizes its required product input', () => {
    expect(component.viewProduct()).toEqual({
      ...product,
      images: ['primary.jpg', 'secondary.jpg'],
    });
    expect(images.normalizeImages).toHaveBeenCalledWith(['raw.jpg'], 'Studio laptop');
  });

  it('derives cart and wishlist state from the shared action facade', () => {
    actions.inCart.mockReturnValue(true);
    actions.inWishlist.mockReturnValue(true);
    fixture.componentRef.setInput('product', { ...product });

    expect(component.inCart()).toBe(true);
    expect(component.inWishlist()).toBe(true);
    expect(actions.inCart).toHaveBeenCalledWith(7);
    expect(actions.inWishlist).toHaveBeenCalledWith(7);
  });

  it('delegates cart and wishlist toggles with the normalized product', () => {
    component.toggleCart();
    component.toggleWishlist();

    const normalized = { ...product, images: ['primary.jpg', 'secondary.jpg'] };
    expect(actions.toggleCart).toHaveBeenCalledWith(normalized);
    expect(actions.toggleWishlist).toHaveBeenCalledWith(normalized);
  });

  it('resolves the primary image and delegates image failures', () => {
    const event = new Event('error');

    expect(component.primaryImageSrc()).toBe('primary.jpg');
    component.onImageError(event);

    expect(images.resolvePrimaryImage).toHaveBeenCalledWith(
      ['primary.jpg', 'secondary.jpg'],
      'Studio laptop',
    );
    expect(images.handleImageError).toHaveBeenCalledWith(event, 'Studio laptop');
  });

  it('renders semantic product links in grid view', async () => {
    await fixture.whenStable();

    const links = fixture.nativeElement.querySelectorAll('a[href="/product/7"]');
    expect(links.length).toBe(2);
    expect(fixture.nativeElement.querySelector('[role="link"]')).toBeNull();
  });

  it('renders the list variant and hides its duplicate wishlist action', async () => {
    fixture.componentRef.setInput('isListView', true);
    fixture.componentRef.setInput('wishlistView', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.list-card')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.favorite-btn')).toBeNull();
  });

  it('exposes precise installment amounts', () => {
    expect(component.getInstallmentAmount(1250, 12)).toBe(104.16);
  });
});
