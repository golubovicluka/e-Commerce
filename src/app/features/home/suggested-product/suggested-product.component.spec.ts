import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SuggestedProductComponent } from './suggested-product.component';
import { ProductImageService } from 'src/app/shared/product-image.service';

describe('SuggestedProductComponent', () => {
    let component: SuggestedProductComponent;
    let fixture: ComponentFixture<SuggestedProductComponent>;
    let images: any;

    beforeEach(async () => {
        images = {
            resolvePrimaryImage: vi.fn().mockName("ProductImageService.resolvePrimaryImage"),
            handleImageError: vi.fn().mockName("ProductImageService.handleImageError")
        };
        images.resolvePrimaryImage.mockReturnValue('resolved.jpg');

        await TestBed.configureTestingModule({
    imports: [SuggestedProductComponent],
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
        const emitSpy = vi.spyOn(component.openProductDetails, 'emit').mockReturnValue(undefined);
        component.openDetails(3);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith(3);
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
