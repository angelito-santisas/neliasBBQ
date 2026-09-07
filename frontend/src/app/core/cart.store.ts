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
    this.api.getMenu().pipe(
      tap(items => { this.menuItems.set(items); this.loading.set(false); }),
      catchError(() => { this.menuError.set('The menu is temporarily unavailable.'); this.loading.set(false); return of([]); })
    ).subscribe();
  }

  add(itemId: string): void {
    if (!this.menuItems().some(item => item.id === itemId)) return;
    this.update(values => ({ ...values, [itemId]: Math.min((values[itemId] ?? 0) + 1, 99) }));
  }

  changeQuantity(itemId: string, delta: number): void {
    this.update(values => {
      const next = (values[itemId] ?? 0) + delta;
      if (next <= 0) {
        const { [itemId]: removed, ...rest } = values;
        void removed;
        return rest;
      }
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
