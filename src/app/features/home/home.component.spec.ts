import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/shared/notification.service';
import { of, throwError } from 'rxjs';

import { HomeComponent } from './home.component';
import { ProductsService } from '../products/products.service';
import { ProductImageService } from 'src/app/shared/product-image.service';
import { mockProducts } from 'src/app/testing/mock-data';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;
    let products: any;
    let images: any;
    let router: any;
    let messages: any;

    beforeEach(async () => {
        products = {
            getSuggestedProducts: jest.fn().mockName("ProductsService.getSuggestedProducts"),
            getProductsByIds: jest.fn().mockName("ProductsService.getProductsByIds")
        };
        products.getSuggestedProducts.mockReturnValue(of({ data: { product: [mockProducts[0]] } }) as any);
        products.getProductsByIds.mockReturnValue(of({ data: { product: [mockProducts[0], mockProducts[1]] } }) as any);
        images = {
            normalizeImages: jest.fn().mockName("ProductImageService.normalizeImages"),
            resolvePrimaryImage: jest.fn().mockName("ProductImageService.resolvePrimaryImage"),
            getFallbackImageByName: jest.fn().mockName("ProductImageService.getFallbackImageByName"),
            handleImageError: jest.fn().mockName("ProductImageService.handleImageError")
        };
        images.normalizeImages.mockReturnValue(['normalized.jpg', 'fallback.jpg']);
        images.resolvePrimaryImage.mockReturnValue('featured.jpg');
        images.getFallbackImageByName.mockReturnValue('data:image/svg+xml,fallback');
        router = {
            navigate: jest.fn().mockName("Router.navigate")
        };
        messages = {
            add: jest.fn().mockName("MessageService.add")
        };

        await TestBed.configureTestingModule({
    imports: [HomeComponent],
    providers: [
        { provide: ProductsService, useValue: products },
        { provide: ProductImageService, useValue: images },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
        { provide: NotificationService, useValue: messages },
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
        expect(component.suggestedProductsLoadState).toBe('ready');
        expect(component.suggestedProducts.length).toBe(1);
        expect(component.suggestedProducts[0].images).toEqual(['normalized.jpg', 'fallback.jpg']);
        expect(images.normalizeImages).toHaveBeenCalled();
    });

    it('ngOnInit loads featured product images from the catalog', () => {
        expect(products.getProductsByIds).toHaveBeenCalledWith([1, 13, 4]);
        expect(images.resolvePrimaryImage).toHaveBeenCalled();
        expect(component.macbookImg).toBe('featured.jpg');
        expect(component.iphoneImg).toBeTruthy();
        expect(component.iphoneSub).toContain('OLED');
        expect(component.ipadImg).toBeTruthy();
    });

    it('redirect navigates to the product details route', () => {
        component.redirect(4);
        expect(router.navigate).toHaveBeenCalledWith(['/product', 4]);
    });

    it('submitForm rejects invalid email addresses', () => {
        component.newsletterEmail = 'not-an-email';
        component.submitForm();
        expect(messages.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
    });

    it('submitForm accepts a valid email address', () => {
        component.newsletterEmail = 'shopper@example.com';
        component.submitForm();
        expect(messages.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
        expect(component.newsletterEmail).toBe('');
        expect(component.newsletterSubmitted).toBe(true);
    });

    it('marks suggested products as failed when the catalog request errors', () => {
        products.getSuggestedProducts.mockReturnValue(throwError(() => new Error('offline')));
        const errorFixture = TestBed.createComponent(HomeComponent);
        const errorComponent = errorFixture.componentInstance;

        errorComponent.ngOnInit();

        expect(errorComponent.suggestedProductsLoadState).toBe('error');
    });

    it('loads all three featured slots and keeps fallback copy for blank descriptions', () => {
        products.getProductsByIds.mockReturnValue(of({
            data: {
                product: [
                    { ...mockProducts[0], id: 1, name: 'Mac', description: ' Fast ' },
                    { ...mockProducts[1], id: 13, name: 'iPad', description: '   ' },
                    { ...mockProducts[2], id: 4, name: 'iPhone', description: undefined },
                ],
            },
        }));
        const featuredFixture = TestBed.createComponent(HomeComponent);
        const featuredComponent = featuredFixture.componentInstance;

        featuredComponent.ngOnInit();

        expect(featuredComponent.macbookName).toBe('Mac');
        expect(featuredComponent.macbookSub).toBe('Fast');
        expect(featuredComponent.ipadName).toBe('iPad');
        expect(featuredComponent.ipadSub).toContain('Apple Pencil');
        expect(featuredComponent.iphoneName).toBe('iPhone');
    });

    it('rejects a missing newsletter email', () => {
        component.newsletterEmail = undefined as any;
        component.submitForm();

        expect(messages.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
    });

    it('delegates hero image failures to ProductImageService', () => {
        const event = { target: {} } as Event;
        component.onHeroImageError(event, 'MacBook');

        expect(images.handleImageError).toHaveBeenCalledWith(event, 'MacBook');
    });

    it('keeps featured fallbacks when the response has no product data', () => {
        products.getProductsByIds.mockReturnValue(of({ data: null }));
        const fallbackComponent = TestBed.createComponent(HomeComponent).componentInstance;

        fallbackComponent.ngOnInit();

        expect(fallbackComponent.macbookImg).toBeTruthy();
        expect(fallbackComponent.ipadImg).toBeTruthy();
        expect(fallbackComponent.iphoneImg).toBeTruthy();
    });
});
