import { staffAutoRefresh } from '../../core/staff-auto-refresh';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, timeout } from 'rxjs';
import { StaffApiService, StaffOrder } from '../../core/staff-api.service';
import { CartStore } from '../../core/cart.store';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-staff-orders', imports:[CurrencyPipe, DatePipe],
  template: `
    <div class="order-tools"><p>Pending orders, oldest first (up to 100). Confirming deducts portions from menu stock. Cancelling a pending order leaves stock unchanged.</p></div>
    <label class="order-search">Search pending orders by order number<input type="search" placeholder="Short order number or full ID" [value]="query()" (input)="search($any($event.target).value)" maxlength="36"></label>
    @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
    @if (loading() && !orders().length) { <p role="status">Loading orders…</p> }
    @else {
      <div class="orders-grid">
        @for (order of orders(); track order.id) {
          <article><h2>Order {{ order.id.slice(0,8) }}</h2><p>{{ order.createdAt | date:'medium' }}</p>
            <ul>@for (line of order.items; track line.menuItemId) { <li><span>{{ line.quantity }} × {{ line.name }}</span><strong>{{ line.lineTotal | currency:'PHP' }}</strong></li> }</ul>
            <p class="total">Total <strong>{{ order.total | currency:'PHP' }}</strong></p>
            <button type="button" (click)="confirm(order)" [disabled]="loading() || !!confirming() || !!cancelling()">{{ confirming() === order.id ? 'Confirming…' : 'Confirm order' }}</button>
            <button type="button" class="cancel-order" (click)="cancel(order)" [disabled]="loading() || !!confirming() || !!cancelling()">{{ cancelling() === order.id ? 'Cancelling…' : 'Cancel order' }}</button>
          </article>
        } @empty { <p>{{ query().trim() ? 'No pending orders match this order number.' : 'No orders awaiting confirmation.' }}</p> }
      </div>
    }`,
  styleUrl:'./staff-orders.component.css'
})
export class StaffOrdersComponent {
  private readonly api = inject(StaffApiService);
  private readonly cart = inject(CartStore);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly query = signal('');
  private searchTimer?: ReturnType<typeof setTimeout>;
  readonly orders = signal<StaffOrder[]>([]);
  readonly loading = signal(false);
  readonly confirming = signal<string | null>(null);
  readonly cancelling = signal<string | null>(null);
  readonly error = signal('');
  constructor() {
    this.load(); staffAutoRefresh(() => this.load());
    this.destroyRef.onDestroy(() => clearTimeout(this.searchTimer));
  }
  search(number: string): void {
    this.query.set(number); clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 300);
  }
  load(): void {
    if (this.loading() || this.confirming() || this.cancelling()) return;
    const number = this.query().trim();
    this.loading.set(true); this.error.set('');
    this.api.getPendingOrders(number).pipe(timeout(10000), takeUntilDestroyed(this.destroyRef), finalize(() => {
      this.loading.set(false);
      if (!this.destroyRef.destroyed && number !== this.query().trim()) this.load();
    })).subscribe({
      next: orders => { if (number === this.query().trim()) this.orders.set(orders); },
      error: () => { if (number === this.query().trim()) this.error.set('Orders could not be loaded. Updates will retry automatically.'); }
    });
  }
  confirm(order: StaffOrder): void {
    if (this.loading() || this.confirming() || this.cancelling()) return;
    this.confirming.set(order.id); this.error.set('');
    this.api.confirmOrder(order.id).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.confirming.set(null))).subscribe({
      next: () => {
        this.orders.update(orders => orders.filter(item => item.id !== order.id));
        this.cart.refreshMenu(); this.notifications.show(`Order ${order.id.slice(0,8)} confirmed. Stock updated.`);
      },
      error: err => this.error.set(err?.error?.detail || 'Order could not be confirmed. The list will update automatically; check its status before retrying.')
    });
  }
  cancel(order: StaffOrder): void {
    if (this.loading() || this.confirming() || this.cancelling()) return;
    this.cancelling.set(order.id); this.error.set('');
    this.api.cancelOrder(order.id).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.cancelling.set(null))).subscribe({
      next: () => {
        this.orders.update(orders => orders.filter(item => item.id !== order.id));
        this.notifications.show(`Order ${order.id.slice(0,8)} cancelled.`);
      },
      error: err => this.error.set(err?.error?.detail || 'Order could not be cancelled. The list will update automatically; check its status before retrying.')
    });
  }
}
