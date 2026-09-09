import { staffAutoRefresh } from '../../core/staff-auto-refresh';
import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, timeout } from 'rxjs';
import { StaffApiService, StaffMenuItem } from '../../core/staff-api.service';
import { MenuEditorComponent } from './menu-editor.component';
import { CartStore } from '../../core/cart.store';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-staff-menu', imports: [CurrencyPipe, MenuEditorComponent],
  template: `
    <div class="menu-tools">
      <button type="button" class="add-product" (click)="addProduct()" [disabled]="loading()">+ Add product</button>
      <label>Search menu<input type="search" placeholder="Name or category" [value]="query()" (input)="query.set($any($event.target).value)"></label>
    </div>
    @if (error()) { <p role="alert">{{ error() }}</p> }
    @if (loading() && !items().length) { <p role="status">Loading menu…</p> }
    @else {
      <p class="menu-count">{{ filtered().length }} menu items · Includes active and hidden items</p>
      <div class="staff-menu-grid">
        @for (item of filtered(); track item.id) {
          <article>
            <div class="menu-photo"><img [src]="item.imageUrl" [alt]="item.name" loading="lazy" (error)="$any($event.target).style.visibility = 'hidden'" (load)="$any($event.target).style.visibility = 'visible'"></div>
            <div class="menu-copy"><span class="category">{{ item.category }}</span><h2>{{ item.name }}</h2><p>{{ item.description }}</p>
              <div class="menu-price"><strong>{{ item.price | currency:'PHP' }}</strong><span [class.hidden-item]="!item.active">{{ item.active ? 'Published' : 'Hidden' }}</span></div>
              <p class="stock-count">{{ item.stockAvailable == null ? 'Stock not set' : item.stockAvailable === 0 ? 'Sold out' : item.stockAvailable + ' portions available' }}</p>
              <button type="button" class="edit-item" (click)="editing.set(item)" [disabled]="loading()" [attr.aria-label]="'Edit ' + item.name">Edit item</button>
            </div>
          </article>
        } @empty { @if (!error()) { <p>No menu items match your search.</p> } }
      </div>
    }
    @if (editing(); as item) { <app-menu-editor [item]="item" [categories]="categories()" (dismissed)="editing.set(null); load()" (saved)="onSaved($event)" /> }`,
  styleUrl: './staff-menu.component.css', changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaffMenuComponent {
  private readonly api = inject(StaffApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cart = inject(CartStore);
  private readonly notifications = inject(NotificationService);
  readonly editing = signal<StaffMenuItem | null>(null);
  readonly items = signal<StaffMenuItem[]>([]);
  readonly categories = computed(() => [...new Set(this.items().map(item => item.category))]);
  readonly query = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly filtered = computed(() => this.items().filter(item =>
    `${item.name} ${item.category}`.toLowerCase().includes(this.query().trim().toLowerCase())));
  constructor() { this.load(); staffAutoRefresh(() => this.load()); }
  addProduct(): void {
    this.editing.set({id:'',name:'',category:'Classics',description:'',price:0,stockAvailable:0,active:true,version:0,imageUrl:'/menu-placeholder.svg'});
  }
  onSaved(item: StaffMenuItem): void {
    const created = !this.editing()?.id;
    this.items.update(items => (created ? [...items, item] : items.map(current => current.id === item.id ? item : current))
      .sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)));
    if (created) this.query.set('');
    this.editing.set(null); this.cart.refreshMenu(); this.notifications.show(`${item.name} was ${created ? 'added to the menu' : 'updated'}.`);
  }
  load(): void {
    if (this.loading() || this.editing()) return;
    this.loading.set(true); this.error.set('');
    this.api.getMenu().pipe(timeout(10000), takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false))).subscribe({
      next: items => this.items.set(items),
      error: () => this.error.set('Menu could not be loaded. Check your connection. Updates will retry automatically.')
    });
  }
}
