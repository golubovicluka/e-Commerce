import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { provideRouter } from '@angular/router';

import { OverviewComponent } from './overview.component';
import { CartService } from 'src/app/shared/cart.service';
import { mockProducts } from 'src/app/testing/mock-data';

describe('OverviewComponent', () => {
    let component: OverviewComponent;
    let fixture: ComponentFixture<OverviewComponent>;
    let cart: any;

    beforeEach(async () => {
        cart = {
            cartLinesSignal: signal([
                { product: mockProducts[0], quantity: 1, lineTotal: mockProducts[0].price },
                { product: mockProducts[1], quantity: 1, lineTotal: mockProducts[1].price },
            ]),
            totalPriceSignal: signal(mockProducts[0].price + mockProducts[1].price),
        };

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

    it('exposes the cart lines and total signals from CartService', () => {
        const lines = component.cartLines();
        expect(lines.length).toBe(2);
        expect(lines[0].product).toEqual(mockProducts[0]);
        expect(component.total()).toBe(mockProducts[0].price + mockProducts[1].price);
    });
});
