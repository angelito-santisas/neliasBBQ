import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { CartStore } from '../../core/cart.store';
import { NotificationService } from '../../core/notification.service';

@Component({
  imports: [CurrencyPipe, FormsModule, RouterLink],
  template: `
    <section class="page-section active">
      <div class="section-header"><h2>Your Barbecue Order</h2><p>Review your selected skewers before proceeding to checkout.</p></div>
      <div class="cart-container">
        <div class="cart-items-list">
          @if (!cart.lines().length) { <div class="empty-cart"><p>Your order cart is currently empty.</p><a class="btn btn-outline" routerLink="/menu">Explore Menu</a></div> }
          @for (line of cart.lines(); track line.item.id) {
            <div class="cart-item">
              <img [src]="line.item.imageUrl" class="cart-item-img" [alt]="line.item.name">
              <div class="cart-item-info"><h4>{{ line.item.name }}</h4><p>{{ line.item.price | currency:'PHP' }} each</p></div>
              <div class="qty-controls"><button class="qty-btn" type="button" (click)="cart.changeQuantity(line.item.id, -1)" [attr.aria-label]="'Decrease ' + line.item.name">−</button><span>{{ line.quantity }}</span><button class="qty-btn" type="button" (click)="cart.changeQuantity(line.item.id, 1)" [attr.aria-label]="'Increase ' + line.item.name">+</button></div>
              <div class="cart-line-total">{{ line.item.price * line.quantity | currency:'PHP' }}</div>
            </div>
          }
        </div>
        <div class="cart-summary">
          <h3>Order Summary</h3><div class="summary-row"><span>Subtotal</span><span>{{ cart.subtotal() | currency:'PHP' }}</span></div><div class="summary-row"><span>Service & Packaging Fee</span><span>{{ serviceFee() | currency:'PHP' }}</span></div><div class="summary-row total"><span>Total</span><span>{{ cart.subtotal() + serviceFee() | currency:'PHP' }}</span></div>
          <div class="form-group"><label for="instructions">Special Instructions</label><textarea id="instructions" rows="3" maxlength="300" [(ngModel)]="instructions"></textarea></div>
          @if (cart.exceedsStock()) { <p role="alert">Stock has changed. Reduce your quantities before checking out.</p> }
          <p>Orders await staff confirmation. Stock is deducted when staff confirms.</p>
          <button class="btn btn-primary full-width" type="button" (click)="checkout()" [disabled]="!cart.lines().length || submitting() || cart.exceedsStock()">{{ submitting() ? 'Submitting…' : 'Proceed To Checkout' }}</button>
        </div>
      </div>
    </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent {
  readonly cart = inject(CartStore);
  private readonly api = inject(ApiService);
  private readonly notifications = inject(NotificationService);
  readonly submitting = signal(false);
  instructions = '';
  constructor() { this.cart.refreshMenu(); }
  serviceFee(): number { return this.cart.lines().length ? 50 : 0; }
  checkout(): void {
    if (!this.cart.lines().length || this.submitting() || this.cart.exceedsStock()) return;
    this.submitting.set(true);
    this.api.createOrder(this.cart.toOrderRequest(this.instructions.trim())).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: order => { this.cart.clear(); this.instructions = ''; this.notifications.show(`Order ${order.id.slice(0, 8)} submitted. Awaiting staff confirmation.`); },
      error: err => { this.cart.refreshMenu(); this.notifications.show(err?.error?.detail || 'Order could not be submitted. Please try again.'); }
    });
  }
}
