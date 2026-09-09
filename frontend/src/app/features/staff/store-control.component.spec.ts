import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StaffAuthService } from '../../core/staff-auth.service';
import { StoreControlComponent } from './store-control.component';

describe('StoreControlComponent', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('keeps a saved closure when an older heartbeat finishes later', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
      { provide: StaffAuthService, useValue: { accessToken: 'test-token' } }] });
    const fixture = TestBed.createComponent(StoreControlComponent);
    const component = fixture.componentInstance;
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/menu').flush([]);
    http.expectOne('/api/v1/store').flush({ open: true });
    component.cart.refreshMenu();
    const oldMenu = http.expectOne('/api/v1/menu');
    const oldStatus = http.expectOne('/api/v1/store');
    component.toggle();
    component.toggle();
    const save = http.expectOne('/api/v1/staff/store');
    expect(save.request.body).toEqual({ open: false });
    expect(save.request.headers.get('Authorization')).toBe('Bearer test-token');
    save.flush({ open: false });
    oldMenu.flush([]);
    oldStatus.flush({ open: true });
    expect(component.cart.storeOpen()).toBe(false);
    http.expectOne('/api/v1/menu').flush([]);
    http.expectOne('/api/v1/store').flush({ open: false });
    expect(component.cart.storeOpen()).toBe(false);
    expect(component.saving()).toBe(false);
  });
});
