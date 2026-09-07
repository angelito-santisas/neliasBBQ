import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StaffAuthService } from './staff-auth.service';

describe('StaffAuthService', () => {
  let auth: StaffAuthService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    auth = TestBed.inject(StaffAuthService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('denies access without a session', () => {
    auth.verify().subscribe(allowed => expect(allowed).toBe(false));
    http.expectNone('/api/v1/staff/me');
  });
  it('checks with the server and clears rejected sessions', () => {
    auth.login('staff@example.com', 'password').subscribe();
    http.expectOne('/api/v1/auth/login').flush({ accessToken: 'example-token' });
    auth.verify().subscribe(allowed => expect(allowed).toBe(false));
    const request = http.expectOne('/api/v1/staff/me');
    expect(request.request.headers.get('Authorization')).toBe('Bearer example-token');
    request.flush({}, { status: 403, statusText: 'Forbidden' });
    auth.verify().subscribe(allowed => expect(allowed).toBe(false));
    http.expectNone('/api/v1/staff/me');
  });
});
