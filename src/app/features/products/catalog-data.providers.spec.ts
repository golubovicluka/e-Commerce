import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';

import { provideCatalogData } from './catalog-data.providers';
import { ProductsService } from './products.service';

describe('provideCatalogData', () => {
  it('creates the route-scoped Apollo client and products service', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ...provideCatalogData(),
      ],
    });

    expect(TestBed.inject(Apollo)).toBeTruthy();
    expect(TestBed.inject(ProductsService)).toBeTruthy();
  });
});
