import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ProductImageService } from 'src/app/shared/product-image.service';

import { CategoryComponent } from './category.component';

describe('CategoryComponent', () => {
    let component: CategoryComponent;
    let fixture: ComponentFixture<CategoryComponent>;
    let images: any;

    beforeEach(async () => {
        images = {
            getCategoryImage: jest.fn().mockName("ProductImageService.getCategoryImage")
        };
        images.getCategoryImage.mockImplementation((name: string) => name === 'Electronics' ? 'https://example.com/electronics.jpg' : 'data:image/svg+xml,fallback');

        await TestBed.configureTestingModule({
    imports: [CategoryComponent],
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
        const emitSpy = jest.spyOn(component.applyCategoryFilter, 'emit').mockReturnValue(undefined);
        component.openProductsPage('Electronics');
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith('Electronics');
    });

    it('getCategoryImage delegates to ProductImageService', () => {
        expect(component.getCategoryImage('Electronics')).toContain('http');
        expect(images.getCategoryImage).toHaveBeenCalledWith('Electronics');
    });

    it('getCategoryImage returns a fallback for unmapped categories', () => {
        expect(component.getCategoryImage('Totally Unknown Category')).toMatch(/^data:image\/svg\+xml,/);
    });
});
