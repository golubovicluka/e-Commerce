import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FiltersComponent } from './filters.component';

/**
 * FiltersComponent injects ProductsService, which depends on Apollo. The CLI
 * stub provided neither, so it threw `No provider for Apollo!`. ApolloTestingModule
 * satisfies that graph; we additionally cover the filter event emitter.
 */
describe('FiltersComponent', () => {
    let component: FiltersComponent;
    let fixture: ComponentFixture<FiltersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
    imports: [FiltersComponent],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();

        fixture = TestBed.createComponent(FiltersComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('changeFilter forwards the selected filter object to subscribers', () => {
        const emitSpy = jest.spyOn(component.filtersObject, 'emit').mockReturnValue(undefined);
        const payload = ['Smartphones', 'Laptops'];
        component.changeFilter(payload);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith(payload);
    });

    it('adds and removes subcategory filters', () => {
        const emitSpy = jest.spyOn(component.filtersObject, 'emit').mockReturnValue(undefined);

        component.onFilterToggle('Phones', true);
        component.onFilterToggle('Laptops', true);
        component.onFilterToggle('Phones', false);

        expect(component.selectedFilters).toEqual(['Laptops']);
        expect(emitSpy).toHaveBeenLastCalledWith(['Laptops']);
    });

    it('keeps selections from several categories and restores them from the input', () => {
        const emitSpy = jest.spyOn(component.filtersObject, 'emit').mockReturnValue(undefined);
        fixture.componentRef.setInput('categories', [
            { id: 1, name: 'Electronics', subcategories: [{ id: 1, name: 'Phones' }] },
            { id: 2, name: 'Home', subcategories: [{ id: 2, name: 'Smart devices' }] },
        ]);
        fixture.componentRef.setInput('selectedFilters', ['Phones']);
        fixture.detectChanges();

        const boxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
        expect(boxes[0].checked).toBe(true);
        expect(boxes[1].checked).toBe(false);

        boxes[1].click();
        expect(emitSpy).toHaveBeenLastCalledWith(['Phones', 'Smart devices']);
    });
});
