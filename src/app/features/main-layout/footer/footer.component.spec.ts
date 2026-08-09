import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  it('uses real internal links for storefront navigation', () => {
    const links = [...fixture.nativeElement.querySelectorAll('a')] as HTMLAnchorElement[];
    expect(links.some((link) => link.getAttribute('href') === '/home')).toBe(true);
    expect(links.some((link) => link.getAttribute('href') === '/products/search')).toBe(true);
    expect(links.some((link) => link.getAttribute('href') === '/categories')).toBe(true);
  });

  it('protects external links from opener access', () => {
    const externalLinks = [
      ...fixture.nativeElement.querySelectorAll('a[target="_blank"]'),
    ] as HTMLAnchorElement[];

    expect(externalLinks).toHaveLength(2);
    for (const link of externalLinks) {
      expect(link.rel).toContain('noopener');
      expect(link.rel).toContain('noreferrer');
    }
  });
});
