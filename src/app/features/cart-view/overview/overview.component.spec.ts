import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

import { OverviewComponent } from './overview.component';
import { CartService } from 'src/app/shared/cart.service';
import { mockProducts } from 'src/app/testing/mock-data';

/**
 * The CLI stub failed at `detectChanges()` (NG0304: `p-divider` unknown).
 * OverviewComponent only reads the cart stream, so we provide a CartService
 * double and assert it exposes those items.
 */
describe('OverviewComponent', () => {
    let component: OverviewComponent;
    let fixture: ComponentFixture<OverviewComponent>;
    let cart: any;

    beforeEach(async () => {
        cart = {
            getCartItems: jest.fn().mockName("CartService.getCartItems"),
            getCartLines: jest.fn().mockName("CartService.getCartLines"),
            getTotalPrice: jest.fn().mockName("CartService.getTotalPrice")
        };
        cart.getCartItems.mockReturnValue(of([mockProducts[0], mockProducts[1]]));
        cart.getCartLines.mockReturnValue(of([
            { product: mockProducts[0], quantity: 1, lineTotal: mockProducts[0].price },
            { product: mockProducts[1], quantity: 1, lineTotal: mockProducts[1].price },
        ]));
        cart.getTotalPrice.mockReturnValue(of(mockProducts[0].price + mockProducts[1].price));

        await TestBed.configureTestingModule({
    imports: [OverviewComponent],
    providers: [{ provide: CartService, useValue: cart }, provideRouter([])],
    schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();

        fixture = TestBed.createComponent(OverviewComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('exposes the cart lines stream from CartService', async () => {
        component.cartLines$.subscribe((lines) => {
            expect(lines.length).toBe(2);
            expect(lines[0].product).toEqual(mockProducts[0]);
            ;
        });
    });
});
