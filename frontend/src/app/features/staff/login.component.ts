import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { StaffAuthService } from '../../core/staff-auth.service';

@Component({
  imports: [ReactiveFormsModule],
  template: `
    <section class="feedback-form-container">
      <h1>Staff Login</h1>
      <p>Sign in with your staff account to access management.</p>
      <form [formGroup]="form" (ngSubmit)="login()">
        <div class="form-group"><label for="staff-email">Email</label><input id="staff-email" type="email" autocomplete="username" formControlName="email" required></div>
        <div class="form-group"><label for="staff-password">Password</label><input id="staff-password" type="password" autocomplete="current-password" formControlName="password" required></div>
        @if (error()) { <p role="alert">{{ error() }}</p> }
        <button class="btn btn-primary full-width" [disabled]="busy() || form.invalid">{{ busy() ? 'Signing in…' : 'Sign in' }}</button>
      </form>
    </section>`,
  styles: `:host { display: block; } input { width: 100%; min-width: 0; padding: 1rem; background: var(--bg-dark); color: var(--text-primary); border: 1px solid var(--border-gold); border-radius: 4px; font: inherit; } input:focus-visible { outline: 2px solid var(--accent-gold); } h1 { overflow-wrap: anywhere; }`
})
export class StaffLoginComponent {
  private readonly auth = inject(StaffAuthService);
  private readonly router = inject(Router);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });
  login() {
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true); this.error.set('');
    const value = this.form.getRawValue();
    this.auth.login(value.email.trim(), value.password).pipe(finalize(() => { this.busy.set(false); this.form.controls.password.reset(); })).subscribe({
      next: () => void this.router.navigateByUrl('/staff'),
      error: () => this.error.set('Unable to sign in. Check your staff credentials or contact your administrator.')
    });
  }
}
