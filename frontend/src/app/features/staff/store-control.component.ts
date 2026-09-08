import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize, timeout } from 'rxjs';
import { CartStore } from '../../core/cart.store';
import { StaffApiService } from '../../core/staff-api.service';

@Component({
  selector: 'app-store-control',
  template: `
    <div class="store-control">
      <div><strong role="status">{{ cart.storeOpen() === null ? 'Store status unavailable' : cart.storeOpen() ? 'Store is open' : 'Store is closed' }}</strong><p>Closing pauses new orders. Pending orders remain available to staff.</p></div>
      <button type="button" class="staff-primary" (click)="toggle()" [disabled]="saving() || cart.storeOpen() === null">{{ saving() ? 'Saving…' : cart.storeOpen() ? 'Close store' : 'Open store' }}</button>
      @if (cart.storeOpen() === null) { <button type="button" class="staff-secondary" (click)="cart.refreshMenu()">Retry status</button> }
      @if (error()) { <p role="alert">{{ error() }}</p> }
    </div>`,
  styles: [`.store-control{display:flex;align-items:center;flex-wrap:wrap;gap:12px;padding:16px;margin-bottom:24px;border:1px solid #554629;border-radius:8px;background:#1c1d17}.store-control>div{flex:1 1 220px}.store-control strong{color:#e6bc67}.store-control p{font-size:.8rem;margin-top:5px}.store-control button{min-height:42px;padding:10px 16px;border:1px solid #b3914d;border-radius:6px;background:#deb55e;color:#171811;font:inherit;cursor:pointer}.store-control button:disabled{opacity:.55;cursor:default}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreControlComponent {
  readonly cart = inject(CartStore);
  private readonly api = inject(StaffApiService);
  readonly saving = signal(false);
  readonly error = signal('');
  toggle(): void {
    if (this.saving() || this.cart.storeOpen() === null) return;
    this.saving.set(true); this.error.set('');
    this.api.setStoreOpen(!this.cart.storeOpen()).pipe(timeout(10000), finalize(() => this.saving.set(false))).subscribe({
      next: status => { this.cart.storeOpen.set(status.open); this.cart.refreshMenu(); },
      error: () => { this.error.set('Store status could not be saved. Refresh and try again.'); this.cart.refreshMenu(); }
    });
  }
}
