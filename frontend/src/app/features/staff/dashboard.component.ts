import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StaffAuthService } from '../../core/staff-auth.service';

@Component({
  template: `<section class="history-card"><h1>Staff Management</h1><p>You are signed in. Inventory and transaction management will be added here.</p><button class="btn btn-outline full-width" type="button" (click)="logout()">Sign out</button></section>`
})
export class StaffDashboardComponent {
  private readonly auth = inject(StaffAuthService);
  private readonly router = inject(Router);
  logout() { this.auth.logout(); void this.router.navigateByUrl('/staff/login'); }
}
