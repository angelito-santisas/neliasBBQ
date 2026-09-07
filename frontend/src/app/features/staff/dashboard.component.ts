import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { StaffApiService } from '../../core/staff-api.service';
import { StaffAuthService } from '../../core/staff-auth.service';
import { NotificationService } from '../../core/notification.service';
import { InventoryItem, InventoryMovementType, InventoryStatus } from '../../shared/models';

type StaffView = 'overview' | 'inventory';
type StockFilter = 'ALL' | InventoryStatus;

@Component({
  imports: [CurrencyPipe, DatePipe, DecimalPipe, ReactiveFormsModule],
  template: `
    <section class="staff-shell">
      <aside class="staff-sidebar">
        <div class="staff-brand"><span class="brand-mark" aria-hidden="true">N</span><span><strong>Nelia's BBQ</strong><small>Staff portal</small></span></div>
        <nav class="staff-nav" aria-label="Staff navigation">
          <p>Workspace</p>
          <button type="button" [class.active]="view() === 'overview'" (click)="view.set('overview')">
            <span aria-hidden="true">⌂</span> Overview
          </button>
          <button type="button" [class.active]="view() === 'inventory'" (click)="view.set('inventory')">
            <span aria-hidden="true">▦</span> Inventory
            @if (attentionCount() > 0) { <b>{{ attentionCount() }}</b> }
          </button>
          <button type="button" disabled title="Order management is coming soon"><span aria-hidden="true">▤</span> Orders <em>Soon</em></button>
          <button type="button" class="mobile-logout" (click)="logout()"><span aria-hidden="true">↪</span> Sign out</button>
        </nav>
        <div class="staff-sidebar-footer">
          <span class="staff-avatar" aria-hidden="true">S</span>
          <span><strong>Staff account</strong><small>Authorized session</small></span>
          <button type="button" class="icon-button" aria-label="Sign out" title="Sign out" (click)="logout()">↪</button>
        </div>
      </aside>

      <div class="staff-workspace">
        <header class="staff-header">
          <div>
            <p class="eyebrow">Operations</p>
            <h1>{{ view() === 'overview' ? 'Good day, team' : 'Inventory' }}</h1>
            <p>{{ view() === 'overview' ? 'Here is what needs your attention today.' : 'Track ingredients, supplies, and stock levels.' }}</p>
          </div>
          @if (view() === 'inventory') {
            <button type="button" class="staff-primary" (click)="openAddItem()"><span aria-hidden="true">＋</span> Add item</button>
          }
        </header>

        @if (loading()) {
          <div class="staff-state" role="status"><span class="spinner" aria-hidden="true"></span> Loading inventory…</div>
        } @else if (loadError()) {
          <div class="staff-state error" role="alert"><strong>Inventory could not be loaded.</strong><span>{{ loadError() }}</span><button type="button" (click)="loadInventory()">Try again</button></div>
        } @else if (view() === 'overview') {
          <div class="metric-grid">
            <article><span class="metric-icon gold" aria-hidden="true">▦</span><div><p>Total items</p><strong>{{ items().length }}</strong><small>Active inventory lines</small></div></article>
            <article><span class="metric-icon orange" aria-hidden="true">!</span><div><p>Low stock</p><strong>{{ lowStockCount() }}</strong><small>At or below reorder level</small></div></article>
            <article><span class="metric-icon red" aria-hidden="true">×</span><div><p>Out of stock</p><strong>{{ outOfStockCount() }}</strong><small>Requires immediate action</small></div></article>
            <article><span class="metric-icon green" aria-hidden="true">₱</span><div><p>Stock value</p><strong>{{ inventoryValue() | currency:'PHP':'symbol':'1.0-0' }}</strong><small>Based on latest unit cost</small></div></article>
          </div>

          <div class="overview-grid">
            <article class="staff-card attention-card">
              <div class="card-heading"><div><p class="eyebrow">Attention needed</p><h2>Low-stock items</h2></div><button type="button" (click)="showInventory('LOW_STOCK')">View inventory →</button></div>
              @if (attentionItems().length) {
                <div class="attention-list">
                  @for (item of attentionItems(); track item.id) {
                    <button type="button" (click)="openAdjustment(item)">
                      <span class="item-initial">{{ item.name.charAt(0) }}</span>
                      <span><strong>{{ item.name }}</strong><small>{{ item.sku }} · Reorder at {{ item.reorderLevel | number:'1.0-2' }} {{ item.unit }}</small></span>
                      <span class="on-hand"><strong>{{ item.quantity | number:'1.0-2' }}</strong><small>{{ item.unit }} left</small></span>
                      <span class="status-pill" [class.out]="item.status === 'OUT_OF_STOCK'">{{ statusLabel(item.status) }}</span>
                    </button>
                  }
                </div>
              } @else {
                <div class="empty-compact"><span aria-hidden="true">✓</span><p>Everything is sufficiently stocked.</p></div>
              }
            </article>

            <article class="staff-card quick-actions">
              <p class="eyebrow">Shortcuts</p><h2>Quick actions</h2>
              <button type="button" (click)="openAddItem()"><span aria-hidden="true">＋</span><span><strong>Add inventory item</strong><small>Create a new ingredient or supply</small></span><b>→</b></button>
              <button type="button" (click)="showInventory('ALL')"><span aria-hidden="true">▦</span><span><strong>Review all stock</strong><small>Search, filter, and update quantities</small></span><b>→</b></button>
            </article>
          </div>
        } @else {
          <div class="inventory-toolbar">
            <label class="search-field"><span aria-hidden="true">⌕</span><span class="sr-only">Search inventory</span><input type="search" [formControl]="search" placeholder="Search item or SKU"></label>
            <div class="filter-row" role="group" aria-label="Filter inventory by stock status">
              @for (filter of filters; track filter.value) {
                <button type="button" [class.active]="stockFilter() === filter.value" (click)="stockFilter.set(filter.value)">{{ filter.label }} <span>{{ countFor(filter.value) }}</span></button>
              }
            </div>
          </div>

          <article class="inventory-table-card">
            <div class="table-summary"><p><strong>{{ filteredItems().length }}</strong> {{ filteredItems().length === 1 ? 'item' : 'items' }}</p><small>Stock value {{ filteredValue() | currency:'PHP':'symbol':'1.2-2' }}</small></div>
            @if (filteredItems().length) {
              <div class="table-scroll">
                <table>
                  <thead><tr><th>Item</th><th>Category</th><th>On hand</th><th>Reorder at</th><th>Unit cost</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    @for (item of filteredItems(); track item.id) {
                      <tr>
                        <td data-label="Item"><span class="item-cell"><span class="item-initial">{{ item.name.charAt(0) }}</span><span><strong>{{ item.name }}</strong><small>{{ item.sku }}</small></span></span></td>
                        <td data-label="Category">{{ item.category }}</td>
                        <td data-label="On hand"><strong>{{ item.quantity | number:'1.0-2' }}</strong> {{ item.unit }}</td>
                        <td data-label="Reorder at">{{ item.reorderLevel | number:'1.0-2' }} {{ item.unit }}</td>
                        <td data-label="Unit cost">{{ item.unitCost | currency:'PHP':'symbol':'1.2-2' }}</td>
                        <td data-label="Status"><span class="status-pill" [class.out]="item.status === 'OUT_OF_STOCK'" [class.good]="item.status === 'IN_STOCK'">{{ statusLabel(item.status) }}</span></td>
                        <td class="row-actions"><button type="button" (click)="openAdjustment(item)">Update stock</button></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="empty-table"><span aria-hidden="true">⌕</span><h2>No inventory items found</h2><p>Try another search or choose a different stock filter.</p></div>
            }
          </article>
        }
      </div>
    </section>

    @if (modal() === 'add') {
      <div class="modal-backdrop" (click)="closeModal()">
        <section class="staff-modal" role="dialog" aria-modal="true" aria-labelledby="add-title" (click)="$event.stopPropagation()">
          <div class="modal-heading"><div><p class="eyebrow">New stock line</p><h2 id="add-title">Add inventory item</h2></div><button type="button" aria-label="Close" (click)="closeModal()">×</button></div>
          <form [formGroup]="addForm" (ngSubmit)="createItem()">
            <div class="field full"><label for="item-name">Item name</label><input id="item-name" type="text" formControlName="name" placeholder="e.g. Pork shoulder"></div>
            <div class="field"><label for="item-sku">SKU</label><input id="item-sku" type="text" formControlName="sku" placeholder="MEAT-PORK-01"></div>
            <div class="field"><label for="item-category">Category</label><input id="item-category" type="text" formControlName="category" placeholder="Meat"></div>
            <div class="field"><label for="item-unit">Unit</label><select id="item-unit" formControlName="unit"><option value="kg">Kilogram (kg)</option><option value="g">Gram (g)</option><option value="L">Liter (L)</option><option value="bottle">Bottle</option><option value="pack">Pack</option><option value="piece">Piece</option><option value="sack">Sack</option></select></div>
            <div class="field"><label for="item-quantity">Opening quantity</label><input id="item-quantity" type="number" min="0" step="0.01" formControlName="quantity"></div>
            <div class="field"><label for="item-reorder">Reorder level</label><input id="item-reorder" type="number" min="0" step="0.01" formControlName="reorderLevel"></div>
            <div class="field"><label for="item-cost">Unit cost (₱)</label><input id="item-cost" type="number" min="0" step="0.01" formControlName="unitCost"></div>
            @if (formError()) { <p class="form-error full" role="alert">{{ formError() }}</p> }
            <div class="modal-actions full"><button type="button" class="staff-secondary" (click)="closeModal()">Cancel</button><button type="submit" class="staff-primary" [disabled]="saving() || addForm.invalid">{{ saving() ? 'Saving…' : 'Add item' }}</button></div>
          </form>
        </section>
      </div>
    }

    @if (modal() === 'adjust' && selectedItem(); as item) {
      <div class="modal-backdrop" (click)="closeModal()">
        <section class="staff-modal stock-modal" role="dialog" aria-modal="true" aria-labelledby="adjust-title" (click)="$event.stopPropagation()">
          <div class="modal-heading"><div><p class="eyebrow">Stock movement</p><h2 id="adjust-title">Update {{ item.name }}</h2></div><button type="button" aria-label="Close" (click)="closeModal()">×</button></div>
          <div class="current-stock"><span>Current stock</span><strong>{{ item.quantity | number:'1.0-2' }} {{ item.unit }}</strong><small>Updated {{ item.updatedAt | date:'medium' }}</small></div>
          <form [formGroup]="adjustForm" (ngSubmit)="saveAdjustment()">
            <div class="movement-toggle full" role="group" aria-label="Stock movement type">
              <button type="button" [class.active]="movementType() === 'RECEIVED'" (click)="setMovementType('RECEIVED')">Stock received</button>
              <button type="button" [class.active]="movementType() === 'USED'" (click)="setMovementType('USED')">Stock used</button>
            </div>
            <div class="field full"><label for="adjust-quantity">Quantity ({{ item.unit }})</label><input id="adjust-quantity" type="number" min="0.01" step="0.01" formControlName="quantity" placeholder="0.00"></div>
            <div class="field full"><label for="adjust-note">Note <span>Optional</span></label><textarea id="adjust-note" rows="3" maxlength="240" formControlName="note" placeholder="Supplier delivery, kitchen usage, waste…"></textarea></div>
            <div class="stock-preview full"><span>New stock on hand</span><strong [class.negative]="adjustedQuantity(item) < 0">{{ adjustedQuantity(item) | number:'1.0-2' }} {{ item.unit }}</strong></div>
            @if (formError()) { <p class="form-error full" role="alert">{{ formError() }}</p> }
            <div class="modal-actions full"><button type="button" class="staff-secondary" (click)="closeModal()">Cancel</button><button type="submit" class="staff-primary" [disabled]="saving() || adjustForm.invalid || adjustedQuantity(item) < 0">{{ saving() ? 'Updating…' : 'Update stock' }}</button></div>
          </form>
        </section>
      </div>
    }
  `,
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaffDashboardComponent {
  private readonly auth = inject(StaffAuthService);
  private readonly api = inject(StaffApiService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly items = signal<InventoryItem[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly saving = signal(false);
  readonly formError = signal('');
  readonly view = signal<StaffView>('overview');
  readonly modal = signal<'add' | 'adjust' | null>(null);
  readonly selectedItem = signal<InventoryItem | null>(null);
  readonly stockFilter = signal<StockFilter>('ALL');
  readonly movementType = signal<InventoryMovementType>('RECEIVED');
  readonly search = new FormControl('', { nonNullable: true });
  readonly searchTerm = signal('');
  readonly filters: ReadonlyArray<{ value: StockFilter; label: string }> = [
    { value: 'ALL', label: 'All' }, { value: 'LOW_STOCK', label: 'Low stock' },
    { value: 'OUT_OF_STOCK', label: 'Out of stock' }, { value: 'IN_STOCK', label: 'In stock' }
  ];

  readonly lowStockCount = computed(() => this.items().filter(item => item.status === 'LOW_STOCK').length);
  readonly outOfStockCount = computed(() => this.items().filter(item => item.status === 'OUT_OF_STOCK').length);
  readonly attentionCount = computed(() => this.lowStockCount() + this.outOfStockCount());
  readonly inventoryValue = computed(() => this.items().reduce((sum, item) => sum + item.quantity * item.unitCost, 0));
  readonly attentionItems = computed(() => this.items().filter(item => item.status !== 'IN_STOCK').slice(0, 5));
  readonly filteredItems = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    return this.items().filter(item => (this.stockFilter() === 'ALL' || item.status === this.stockFilter()) &&
      (!term || `${item.name} ${item.sku} ${item.category}`.toLocaleLowerCase().includes(term)));
  });
  readonly filteredValue = computed(() => this.filteredItems().reduce((sum, item) => sum + item.quantity * item.unitCost, 0));

  readonly addForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    sku: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(40)] }),
    category: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    unit: new FormControl('kg', { nonNullable: true, validators: [Validators.required] }),
    quantity: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    reorderLevel: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    unitCost: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] })
  });
  readonly adjustForm = new FormGroup({
    quantity: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    note: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(240)] })
  });

  constructor() {
    this.search.valueChanges.subscribe(value => this.searchTerm.set(value));
    this.loadInventory();
  }

  loadInventory(): void {
    this.loading.set(true); this.loadError.set('');
    this.api.getInventory().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: items => this.items.set(items),
      error: error => this.loadError.set(this.apiError(error, 'Check the server connection and try again.'))
    });
  }

  showInventory(filter: StockFilter): void { this.stockFilter.set(filter); this.view.set('inventory'); }
  countFor(filter: StockFilter): number { return filter === 'ALL' ? this.items().length : this.items().filter(item => item.status === filter).length; }
  statusLabel(status: InventoryStatus): string { return status === 'OUT_OF_STOCK' ? 'Out of stock' : status === 'LOW_STOCK' ? 'Low stock' : 'In stock'; }

  openAddItem(): void {
    this.addForm.reset({ name: '', sku: '', category: '', unit: 'kg', quantity: 0, reorderLevel: 0, unitCost: 0 });
    this.formError.set(''); this.modal.set('add');
  }

  openAdjustment(item: InventoryItem): void {
    this.selectedItem.set(item); this.adjustForm.reset({ quantity: 0, note: '' });
    this.movementType.set('RECEIVED'); this.formError.set(''); this.modal.set('adjust');
  }

  closeModal(): void { if (!this.saving()) { this.modal.set(null); this.selectedItem.set(null); } }
  setMovementType(type: InventoryMovementType): void { this.movementType.set(type); }
  adjustedQuantity(item: InventoryItem): number {
    const amount = Number(this.adjustForm.controls.quantity.value) || 0;
    return item.quantity + (this.movementType() === 'USED' ? -amount : amount);
  }

  createItem(): void {
    if (this.addForm.invalid || this.saving()) return;
    this.saving.set(true); this.formError.set('');
    this.api.createInventoryItem(this.addForm.getRawValue()).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: item => { this.items.update(items => [...items, item].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))); this.saving.set(false); this.closeModal(); this.notifications.show(`${item.name} was added to inventory.`); },
      error: error => this.formError.set(this.apiError(error, 'The item could not be added.'))
    });
  }

  saveAdjustment(): void {
    const item = this.selectedItem();
    if (!item || this.adjustForm.invalid || this.saving() || this.adjustedQuantity(item) < 0) return;
    this.saving.set(true); this.formError.set('');
    this.api.adjustInventory(item.id, { ...this.adjustForm.getRawValue(), movementType: this.movementType() })
      .pipe(finalize(() => this.saving.set(false))).subscribe({
        next: updated => { this.items.update(items => items.map(current => current.id === updated.id ? updated : current)); this.saving.set(false); this.closeModal(); this.notifications.show(`${updated.name} stock was updated.`); },
        error: error => this.formError.set(this.apiError(error, 'Stock could not be updated.'))
      });
  }

  logout(): void { this.auth.logout(); void this.router.navigateByUrl('/staff/login'); }

  private apiError(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const body = (error as { error?: { detail?: unknown } }).error;
      if (typeof body?.detail === 'string') return body.detail;
    }
    return fallback;
  }
}
