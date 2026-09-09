import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartComponent } from './cart.component';

describe('CartComponent checkout', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('locks cart controls through availability checking and submission, then unlocks on failure', async () => {
    const fixture = TestBed.createComponent(CartComponent);
    const http = TestBed.inject(HttpTestingController);
    const availability = () => {
      http.match('/api/v1/menu').forEach(req => req.flush([
        { id: 'dish', name: 'Dish', price: 20, stockAvailable: 5, imageUrl: '/menu-placeholder.svg' }
      ]));
      http.match('/api/v1/store').forEach(req => req.flush({ open: true }));
    };
    availability();
    fixture.componentInstance.cart.add('dish');
    fixture.detectChanges();
    await fixture.whenStable();
    const controls = () => Array.from(fixture.nativeElement.querySelectorAll('.qty-btn, .remove-item, textarea')) as (HTMLButtonElement | HTMLTextAreaElement)[];
    expect(controls().every(control => !control.disabled)).toBe(true);
    fixture.componentInstance.checkout();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(controls().every(control => control.disabled)).toBe(true);
    availability();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(controls().every(control => control.disabled)).toBe(true);
    fixture.componentInstance.checkout();
    const order = http.expectOne('/api/v1/orders');
    expect(order.request.body.items).toEqual([{ menuItemId: 'dish', quantity: 1 }]);
    order.flush({ detail: 'Store closed' }, { status: 400, statusText: 'Bad Request' });
    availability();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(controls().every(control => !control.disabled)).toBe(true);
    expect(fixture.componentInstance.cart.count()).toBe(1);
  });
});
