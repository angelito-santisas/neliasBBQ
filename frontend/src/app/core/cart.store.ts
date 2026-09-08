import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, defer, forkJoin, map, of, timeout } from 'rxjs';
import { ApiService } from './api.service';
import { CartLine, MenuItem, OrderRequest } from '../shared/models';

const STORAGE_KEY = 'nelias-bbq-cart-v2';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly api = inject(ApiService);
  private readonly menuItems = signal<MenuItem[]>([]);
  private readonly quantities = signal<Record<string, number>>(this.loadQuantities());
  private readonly knownItems = signal<Record<string, MenuItem>>({});
  private readonly destroyRef = inject(DestroyRef);
  private menuRequest = 0;
  readonly storeOpen = signal<boolean | null>(null);
  readonly lastChecked = signal<Date | null>(null);
  readonly menu = this.menuItems.asReadonly();
  readonly menuError = signal<string | null>(null);
  readonly loading = signal(true);
  readonly lines = computed<CartLine[]>(() => {
    const menuById = new Map(this.menuItems().map(item => [item.id, item]));
    return Object.entries(this.quantities())
      .map(([id, quantity]) => ({ item: menuById.get(id) ?? this.knownItems()[id] ?? {
        id, name: 'Unavailable product', category: '', description: '', imageUrl: '/menu-placeholder.svg', price: 0, stockAvailable: 0
      }, quantity }));
  });
  readonly count = computed(() => this.lines().reduce((sum, line) => sum + line.quantity, 0));
  readonly subtotal = computed(() => this.lines().reduce((sum, line) => sum + line.item.price * line.quantity, 0));
  readonly canOrder = computed(() => this.storeOpen() === true && !this.menuError() && !this.loading());

  constructor() {
    this.refreshMenu();
    const refresh = () => { if (!document.hidden) this.refreshMenu(); };
    const timer = setInterval(refresh, 15000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    this.destroyRef.onDestroy(() => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
    });
  }

  refreshMenu(): void {
    this.checkAvailability().subscribe();
  }

  checkAvailability() {
    return defer(() => {
      const request = ++this.menuRequest;
      return forkJoin({ items: this.api.getMenu(), store: this.api.getStoreStatus() }).pipe(
        timeout(10000), takeUntilDestroyed(this.destroyRef),
        map(({ items, store }) => {
          if (request !== this.menuRequest) return false;
          this.menuItems.set(items);
          this.knownItems.update(known => ({ ...known, ...Object.fromEntries(items.map(item => [item.id, item])) }));
          this.storeOpen.set(store.open); this.menuError.set(null); this.loading.set(false); this.lastChecked.set(new Date());
          return true;
        }),
        catchError(() => {
          if (request === this.menuRequest) {
            this.menuError.set('Availability could not be checked. Reconnect or try refreshing before ordering.');
            this.storeOpen.set(null); this.loading.set(false);
          }
          return of(false);
        })
      );
    });
  }

  add(itemId: string): void {
    if (!this.canOrder()) return;
    const limit = this.limitFor(itemId);
    if (limit === 0) return;
    this.update(values => ({ ...values, [itemId]: Math.min((values[itemId] ?? 0) + 1, limit) }));
  }

  limitFor(itemId: string): number { return Math.min(this.menuItems().find(item => item.id === itemId)?.stockAvailable ?? 0, 99); }
  readonly exceedsStock = computed(() => this.lines().some(line => line.quantity > this.limitFor(line.item.id)));

  changeQuantity(itemId: string, delta: number): void {
    if (delta > 0 && !this.canOrder()) return;
    this.update(values => {
      const next = (values[itemId] ?? 0) + delta;
      if (next <= 0) {
        const { [itemId]: removed, ...rest } = values;
        void removed;
        return rest;
      }
      if (delta > 0 && next > this.limitFor(itemId)) return values;
      return { ...values, [itemId]: Math.min(next, 99) };
    });
  }

  clear(): void { this.update(() => ({})); }
  remove(itemId: string): void {
    this.update(values => { const { [itemId]: removed, ...rest } = values; void removed; return rest; });
  }

  toOrderRequest(specialInstructions: string): OrderRequest {
    return { items: this.lines().map(line => ({ menuItemId: line.item.id, quantity: line.quantity })), specialInstructions };
  }

  private update(change: (values: Record<string, number>) => Record<string, number>): void {
    this.quantities.update(change);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.quantities())); } catch { /* in-memory fallback */ }
  }

  private loadQuantities(): Record<string, number> {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, number] => Number.isInteger(entry[1]) && Number(entry[1]) > 0));
    } catch { return {}; }
  }
}
