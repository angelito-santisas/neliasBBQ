import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { routes } from '../../app.routes';
import { CartStore } from '../../core/cart.store';
import { StaffApiService } from '../../core/staff-api.service';
import { StaffAuthService } from '../../core/staff-auth.service';

describe('Staff navigation', () => {
  it('opens Orders and Store directly and confines the toggle to Store', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes),
      { provide: StaffAuthService, useValue: { verify: () => of(true) } },
      { provide: StaffApiService, useValue: { getInventory: () => of([]), getPendingOrders: () => of([]) } },
      { provide: CartStore, useValue: { storeOpen: signal(true) } }
    ] });
    const harness = await RouterTestingHarness.create('/staff/orders');
    expect(harness.routeNativeElement?.querySelector('app-staff-orders')).not.toBeNull();
    expect(harness.routeNativeElement?.querySelector('app-store-control')).toBeNull();
    await harness.navigateByUrl('/staff/store');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Store');
    expect(harness.routeNativeElement?.querySelector('app-store-control')?.textContent).toContain('Close store');
    expect(harness.routeNativeElement?.querySelector('app-staff-orders')).toBeNull();
    await harness.navigateByUrl('/staff');
    expect(harness.routeNativeElement?.querySelector('app-store-control')).toBeNull();
  });
});
