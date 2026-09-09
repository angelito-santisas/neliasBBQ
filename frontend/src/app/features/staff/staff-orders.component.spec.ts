import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CartStore } from '../../core/cart.store';
import { StaffAuthService } from '../../core/staff-auth.service';
import { StaffOrdersComponent } from './staff-orders.component';

describe('StaffOrdersComponent', () => {
  const order = { id: 'order-one', items: [], total: 50, status: 'submitted', createdAt: '2026-09-09T00:00:00Z' };
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
    { provide: StaffAuthService, useValue: { accessToken: 'test-token' } },
    { provide: CartStore, useValue: { refreshMenu: vi.fn() } }
  ] }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('searches on the server and discards an older response while keeping the search on refresh', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(StaffOrdersComponent);
      const http = TestBed.inject(HttpTestingController);
      const initial = http.expectOne('/api/v1/staff/orders');
      fixture.componentInstance.search('ABC12345');
      vi.advanceTimersByTime(300);
      initial.flush([order]);
      expect(fixture.componentInstance.orders()).toEqual([]);
      http.expectOne('/api/v1/staff/orders?number=ABC12345').flush([]);
      vi.advanceTimersByTime(15000);
      http.expectOne('/api/v1/staff/orders?number=ABC12345').flush([]);
      fixture.destroy();
    } finally { vi.useRealTimers(); }
  });

  it('cancels through the staff API and prevents competing actions while waiting', () => {
    const fixture = TestBed.createComponent(StaffOrdersComponent);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/staff/orders').flush([order]);
    fixture.detectChanges();
    const cancel = Array.from(fixture.nativeElement.querySelectorAll('button')).find(button => (button as HTMLButtonElement).textContent?.includes('Cancel order')) as HTMLButtonElement;
    cancel.click(); fixture.detectChanges();
    expect(Array.from(fixture.nativeElement.querySelectorAll('button')).every(button => (button as HTMLButtonElement).disabled)).toBe(true);
    fixture.componentInstance.confirm(fixture.componentInstance.orders()[0]);
    fixture.componentInstance.cancel(fixture.componentInstance.orders()[0]);
    const request = http.expectOne('/api/v1/staff/orders/order-one/cancel');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({ ...order, status: 'cancelled' });
    expect(fixture.componentInstance.orders()).toEqual([]);
    expect(TestBed.inject(CartStore).refreshMenu).not.toHaveBeenCalled();
    expect(fixture.componentInstance.cancelling()).toBeNull();
  });

  it('retains an order and unlocks actions after cancellation fails', () => {
    const fixture = TestBed.createComponent(StaffOrdersComponent);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/staff/orders').flush([order]);
    fixture.componentInstance.cancel(fixture.componentInstance.orders()[0]);
    http.expectOne('/api/v1/staff/orders/order-one/cancel').flush({ detail: 'Only pending orders can be cancelled.' }, { status: 400, statusText: 'Bad Request' });
    expect(fixture.componentInstance.orders()).toHaveLength(1);
    expect(fixture.componentInstance.cancelling()).toBeNull();
    expect(fixture.componentInstance.error()).toContain('Only pending');
  });
});
