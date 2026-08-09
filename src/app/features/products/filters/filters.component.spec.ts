import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockCategoriesWithSubcategories } from 'src/app/testing/mock-data';
import { FiltersComponent } from './filters.component';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltersComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categories', mockCategoriesWithSubcategories);
    fixture.detectChanges();
  });

  it('shows every category when no category is selected', () => {
    expect(component.visibleCategories()).toEqual(mockCategoriesWithSubcategories);
  });

  it('limits subcategory choices to the selected category', () => {
    fixture.componentRef.setInput('categoryId', 2);

    expect(component.visibleCategories()).toEqual([mockCategoriesWithSubcategories[1]]);
  });

  it('reports whether a subcategory is selected', () => {
    fixture.componentRef.setInput('selectedSubcategoryIds', [1]);

    expect(component.isSelected(1)).toBe(true);
    expect(component.isSelected(2)).toBe(false);
  });

  it('adds a new subcategory without mutating the controlled input', () => {
    fixture.componentRef.setInput('selectedSubcategoryIds', [1]);
    const emit = jest.spyOn(component.filtersChange, 'emit');

    component.onFilterToggle(2, true);

    expect(emit).toHaveBeenCalledWith([1, 2]);
    expect(component.selectedSubcategoryIds()).toEqual([1]);
  });

  it('does not duplicate an already selected subcategory', () => {
    fixture.componentRef.setInput('selectedSubcategoryIds', [1]);
    const emit = jest.spyOn(component.filtersChange, 'emit');

    component.onFilterToggle(1, true);

    expect(emit).toHaveBeenCalledWith([1]);
  });

  it('removes a deselected subcategory', () => {
    fixture.componentRef.setInput('selectedSubcategoryIds', [1, 2]);
    const emit = jest.spyOn(component.filtersChange, 'emit');

    component.onFilterToggle(1, false);

    expect(emit).toHaveBeenCalledWith([2]);
  });
});
