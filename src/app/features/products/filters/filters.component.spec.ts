import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ApolloTestingModule } from 'apollo-angular/testing';

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
      imports: [ApolloTestingModule],
      declarations: [FiltersComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('changeFilter forwards the selected filter object to subscribers', () => {
    const emitSpy = spyOn(component.filtersObject, 'emit');
    const payload = ['Smartphones', 'Laptops'];
    component.changeFilter(payload);
    expect(emitSpy).toHaveBeenCalledOnceWith(payload);
  });
});
