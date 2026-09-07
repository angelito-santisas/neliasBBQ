import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, CanActivateFn } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StaffAuthService {
  private readonly http = inject(HttpClient);
  private token: string | null = null;
  login(email: string, password: string) {
    this.token = null;
    return this.http.post<{ accessToken: string }>('/api/v1/auth/login', { email, password })
      .pipe(tap(result => this.token = result.accessToken));
  }
  verify() {
    if (!this.token) return of(false);
    return this.http.get('/api/v1/staff/me', { headers: { Authorization: `Bearer ${this.token}` } })
      .pipe(map(() => true), catchError(() => { this.logout(); return of(false); }));
  }
  logout() { this.token = null; }
}

export const staffGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(StaffAuthService).verify().pipe(map(allowed => allowed || router.createUrlTree(['/staff/login'])));
};
