import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { StaffApiService, StaffOrder } from '../../core/staff-api.service';
import { CartStore } from '../../core/cart.store';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-staff-orders', imports:[CurrencyPipe, DatePipe],
  template: `
    <div class="order-tools"><p>Pending orders, oldest first (up to 100). Confirming an order deducts its portions from menu stock.</p><button type="button" (click)="load()" [disabled]="loading() || !!confirming()">Refresh orders</button></div>
    @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
    @if (loading()) { <p role="status">Loading orders…</p> }
    @else {
      <div class="orders-grid">
        @for (order of orders(); track order.id) {
          <article><h2>Order {{ order.id.slice(0,8) }}</h2><p>{{ order.createdAt | date:'medium' }}</p>
            <ul>@for (line of order.items; track line.menuItemId) { <li><span>{{ line.quantity }} × {{ line.name }}</span><strong>{{ line.lineTotal | currency:'PHP' }}</strong></li> }</ul>
            <p class="total">Total <strong>{{ order.total | currency:'PHP' }}</strong></p>
            <button type="button" (click)="confirm(order)" [disabled]="!!confirming()">{{ confirming() === order.id ? 'Confirming…' : 'Confirm order' }}</button>
          </article>
        } @empty { <p>No orders awaiting confirmation.</p> }
      </div>
    }`,
  styleUrl:'./staff-orders.component.css'
})
export class StaffOrdersComponent {
  private readonly api = inject(StaffApiService);
  private readonly cart = inject(CartStore);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly orders = signal<StaffOrder[]>([]);
  readonly loading = signal(false);
  readonly confirming = signal<string | null>(null);
  readonly error = signal('');
  constructor() { this.load(); }
  load(): void {
    if (this.loading() || this.confirming()) return;
    this.loading.set(true); this.error.set('');
    this.api.getPendingOrders().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false))).subscribe({
      next: orders => this.orders.set(orders), error: () => this.error.set('Orders could not be loaded. Try refreshing.')
    });
  }
  confirm(order: StaffOrder): void {
    if (this.confirming()) return;
    this.confirming.set(order.id); this.error.set('');
    this.api.confirmOrder(order.id).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.confirming.set(null))).subscribe({
      next: () => {
        this.orders.update(orders => orders.filter(item => item.id !== order.id));
        this.cart.refreshMenu(); this.notifications.show(`Order ${order.id.slice(0,8)} confirmed. Stock updated.`);
      },
      error: err => this.error.set(err?.error?.detail || 'Order could not be confirmed. Refresh orders to check its status before retrying.')
    });
  }
}
