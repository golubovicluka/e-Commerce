import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CategoryComponent } from './category.component';

/**
 * CategoryComponent is presentational (no injected services), so the original
 * stub already constructed fine — but it asserted nothing beyond truthiness.
 * Added: the @Output emit and the category->image mapping (including the
 * unmapped default).
 */
describe('CategoryComponent', () => {
  let component: CategoryComponent;
  let fixture: ComponentFixture<CategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategoryComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openProductsPage emits the category name', () => {
    const emitSpy = spyOn(component.applyCategoryFilter, 'emit');
    component.openProductsPage('Electronics');
    expect(emitSpy).toHaveBeenCalledOnceWith('Electronics');
  });

  it('getCategoryImage returns a mapped image for known categories', () => {
    expect(component.getCategoryImage('Electronics')).toContain('http');
    expect(component.getCategoryImage('Kitchen')).toContain('http');
  });

  it('getCategoryImage returns undefined for unmapped categories', () => {
    expect(component.getCategoryImage('Totally Unknown Category')).toBeUndefined();
  });
});
