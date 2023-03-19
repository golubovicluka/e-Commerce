import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsView } from './products-view.component';

describe('ProductsView', () => {
  let component: ProductsView;
  let fixture: ComponentFixture<ProductsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductsView]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProductsView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
