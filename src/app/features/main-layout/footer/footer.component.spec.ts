import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FooterComponent } from './footer.component';

/**
 * The CLI stub failed at `detectChanges()` with NG0303 (`routerLink` is not a
 * known property) because no router was provided. Here we inject a Router spy,
 * suppress the router presentation details with NO_ERRORS_SCHEMA, and additionally
 * cover the two real methods.
 */
describe('FooterComponent', () => {
    let component: FooterComponent;
    let fixture: ComponentFixture<FooterComponent>;
    let router: any;

    beforeEach(async () => {
        router = {
            navigate: vi.fn().mockName("Router.navigate")
        };

        await TestBed.configureTestingModule({
    imports: [FooterComponent],
    providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
    ],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();

        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('toHome navigates to /home', () => {
        component.toHome();
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('openLink opens the given URL in a new window without opener access', () => {
        const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
        component.openLink('https://github.com/golubovicluka');
        expect(openSpy).toHaveBeenCalledWith('https://github.com/golubovicluka', '_blank', 'noopener,noreferrer');
    });
});
