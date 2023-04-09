import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestedProductComponent } from './suggested-product.component';

describe('SuggestedProductComponent', () => {
  let component: SuggestedProductComponent;
  let fixture: ComponentFixture<SuggestedProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuggestedProductComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestedProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
