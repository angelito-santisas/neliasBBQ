import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { CartLine, MenuItem, OrderRequest } from '../shared/models';

const STORAGE_KEY = 'nelias-bbq-cart-v2';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly api = inject(ApiService);
  private readonly menuItems = signal<MenuItem[]>([]);
  private readonly quantities = signal<Record<string, number>>(this.loadQuantities());
  private menuRequest = 0;
  readonly menu = this.menuItems.asReadonly();
  readonly menuError = signal<string | null>(null);
  readonly loading = signal(true);
  readonly lines = computed<CartLine[]>(() => {
    const menuById = new Map(this.menuItems().map(item => [item.id, item]));
    return Object.entries(this.quantities())
      .map(([id, quantity]) => ({ item: menuById.get(id), quantity }))
      .filter((line): line is CartLine => Boolean(line.item));
  });
  readonly count = computed(() => this.lines().reduce((sum, line) => sum + line.quantity, 0));
  readonly subtotal = computed(() => this.lines().reduce((sum, line) => sum + line.item.price * line.quantity, 0));

  constructor() {
    this.refreshMenu();
  }

  refreshMenu(): void {
    const request = ++this.menuRequest;
    this.api.getMenu().pipe(
      tap(items => { if (request === this.menuRequest) { this.menuItems.set(items); this.menuError.set(null); this.loading.set(false); } }),
      catchError(() => { if (request === this.menuRequest) { this.menuError.set('The menu is temporarily unavailable.'); this.loading.set(false); } return of([]); })
    ).subscribe();
  }

  add(itemId: string): void {
    const limit = this.limitFor(itemId);
    if (limit === 0) return;
    this.update(values => ({ ...values, [itemId]: Math.min((values[itemId] ?? 0) + 1, limit) }));
  }

  limitFor(itemId: string): number { return Math.min(this.menuItems().find(item => item.id === itemId)?.stockAvailable ?? 0, 99); }
  readonly exceedsStock = computed(() => this.lines().some(line => line.quantity > this.limitFor(line.item.id)));

  changeQuantity(itemId: string, delta: number): void {
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
