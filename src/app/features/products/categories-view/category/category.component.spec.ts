import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
        images.getCategoryImage.mockImplementation((name: string) =>
          name === 'Electronics'
            ? 'assets/images/categories/electronics.jpg'
            : 'assets/images/categories/unknown.jpg',
        );

        await TestBed.configureTestingModule({
    imports: [CategoryComponent],
    providers: [
        { provide: ProductImageService, useValue: images },
        { provide: ActivatedRoute, useValue: {} },
    ],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();

        fixture = TestBed.createComponent(CategoryComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getCategoryImage delegates to ProductImageService', () => {
        expect(component.getCategoryImage('Electronics')).toContain('assets/images/categories/');
        expect(images.getCategoryImage).toHaveBeenCalledWith('Electronics');
    });

    it('getCategoryImage returns a fallback for unmapped categories', () => {
        expect(component.getCategoryImage('Totally Unknown Category')).toContain('assets/images/categories/');
    });
});
