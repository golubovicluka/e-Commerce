import { TestBed } from '@angular/core/testing';
import { ROUTER_CONFIGURATION } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';

describe('AppRoutingModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppRoutingModule],
    });
  });

  it('scrolls to the top after forward navigation', () => {
    const routerOptions = TestBed.inject(ROUTER_CONFIGURATION);

    expect(routerOptions.scrollPositionRestoration).toBe('enabled');
  });
});
