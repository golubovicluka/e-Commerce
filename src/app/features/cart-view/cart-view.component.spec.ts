import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CartService } from 'src/app/shared/cart.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { createMockProduct } from 'src/app/testing/mock-data';
import { CartViewComponent } from './cart-view.component';

describe('CartViewComponent', () => {
  let component: CartViewComponent;
  let fixture: ComponentFixture<CartViewComponent>;
  let cart: {
    setQuantity: jest.Mock;
    removeFromCart: jest.Mock;
    cartLinesSignal: ReturnType<typeof signal>;
    totalPriceSignal: ReturnType<typeof signal>;
    numberOfItemsSignal: ReturnType<typeof signal>;
  };
  let router: { navigate: jest.Mock; events: Subject<unknown> };
  let images: { resolvePrimaryImage: jest.Mock; handleImageError: jest.Mock };
  let route: {
    firstChild: { snapshot: { url: Array<{ path: string }> } } | null;
  };

  beforeEach(async () => {
    cart = {
      setQuantity: jest.fn(() => true),
      removeFromCart: jest.fn(() => true),
      cartLinesSignal: signal([]),
      totalPriceSignal: signal(0),
      numberOfItemsSignal: signal(0),
    };
    router = { navigate: jest.fn(), events: new Subject() };
    images = {
      resolvePrimaryImage: jest.fn(() => 'resolved.jpg'),
      handleImageError: jest.fn(),
    };
    route = { firstChild: null };

    await TestBed.configureTestingModule({
      imports: [CartViewComponent],
      providers: [
        { provide: CartService, useValue: cart },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: ProductImageService, useValue: images },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartViewComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  function navigateTo(childPath: string | null): void {
    route.firstChild = childPath ? { snapshot: { url: [{ path: childPath }] } } : null;
    router.events.next(new NavigationEnd(1, childPath ? `/cart/${childPath}` : '/cart', '/cart'));
  }

  it('exposes derived cart state and static checkout metadata', () => {
    cart.numberOfItemsSignal.set(3);

    expect(component.numberOfItems).toBe(3);
    expect(component.cartLines()).toEqual([]);
    expect(component.totalPrice()).toBe(0);
    expect(component.stepperItems).toHaveLength(3);
    expect(component.monthlyPaymentOptions.length).toBeGreaterThan(0);
  });

  it('opens shipping from the cart and returns from an active checkout', () => {
    component.openShippingView();
    expect(router.navigate).toHaveBeenCalledWith(['/cart/shipping']);

    navigateTo('shipping');
    component.openShippingView();
    expect(router.navigate).toHaveBeenLastCalledWith(['/cart']);
  });

  it('describes the current checkout call to action', () => {
    expect(component.checkoutCtaLabel).toBe('Preview shipping details');
    navigateTo('shipping');
    expect(component.checkoutCtaLabel).toBe('Back to cart');
  });

  it('increments only below stock and decrements only above one', () => {
    component.incrementProductCount(7, 5, 2);
    expect(cart.setQuantity).toHaveBeenCalledWith(7, 3);

    cart.setQuantity.mockClear();
    component.incrementProductCount(7, 2, 2);
    expect(cart.setQuantity).not.toHaveBeenCalled();

    component.decrementProductCount(7, 3);
    expect(cart.setQuantity).toHaveBeenCalledWith(7, 2);

    cart.setQuantity.mockClear();
    component.decrementProductCount(7, 1);
    expect(cart.setQuantity).not.toHaveBeenCalled();
  });

  it('delegates direct quantity changes by stable product id', () => {
    component.onQuantityChange(7, 4);
    expect(cart.setQuantity).toHaveBeenCalledWith(7, 4);
  });

  it('maps known, unknown, and empty child routes to checkout progress', () => {
    navigateTo('overview');
    expect(component.checkoutActive).toBe(true);
    expect(component.activeIndex).toBe(1);

    navigateTo('payment');
    expect(component.activeIndex).toBe(2);

    navigateTo('unknown');
    expect(component.activeIndex).toBe(0);

    navigateTo(null);
    expect(component.checkoutActive).toBe(false);
    expect(component.activeIndex).toBe(0);
  });

  it('delegates removal and product image behavior', () => {
    const product = createMockProduct({ id: 7, name: 'Phone', images: ['phone.jpg'] });
    const event = new Event('error');

    component.removeFromCart(product);
    expect(cart.removeFromCart).toHaveBeenCalledWith(product);
    expect(component.getProductImage(product)).toBe('resolved.jpg');
    expect(images.resolvePrimaryImage).toHaveBeenCalledWith(['phone.jpg'], 'Phone');

    component.onProductImageError(event, 'Phone');
    expect(images.handleImageError).toHaveBeenCalledWith(event, 'Phone');
  });

  it('stops reacting to router events after destruction', () => {
    navigateTo('overview');
    fixture.destroy();

    navigateTo('payment');

    expect(component.activeIndex).toBe(1);
  });
});
