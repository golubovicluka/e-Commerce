import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

/**
 * These tests previously asserted the Angular CLI scaffold values — `title`
 * equal to 'datastructures' and a "<title> app is running!" banner — both of
 * which were removed long ago (the title is now 'Webshop' and the template only
 * renders <app-header>/<router-outlet>/<app-footer>). They were red on every
 * run. The assertions below match what the component actually does.
 */
describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
    imports: [RouterTestingModule, AppComponent],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();
    });

    it('should create the app', () => {
        const app = TestBed.createComponent(AppComponent).componentInstance;
        expect(app).toBeTruthy();
    });

    it(`should have as title 'Webshop'`, () => {
        const app = TestBed.createComponent(AppComponent).componentInstance;
        expect(app.title).toEqual('Webshop');
    });

    it('renders the header, router outlet and footer shell', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('app-header')).not.toBeNull();
        expect(compiled.querySelector('router-outlet')).not.toBeNull();
        expect(compiled.querySelector('app-footer')).not.toBeNull();
    });
});
