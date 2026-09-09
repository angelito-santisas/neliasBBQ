import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../core/cart.store';

@Component({
  imports: [CurrencyPipe, RouterLink],
  styleUrl: './menu.component.css',
  template: `
    <section class="page-section active menu-page" [class.has-cart]="cart.count() > 0">
      <div class="section-header"><h2>Our Barbecue Selection</h2><p>Authentic Filipino offal and skewers, slow-roasted over premium hardwood charcoal and glazed with heirloom marinades.</p></div>
      @if (cart.loading()) { <p class="load-message">Loading menu…</p> }
      @if (cart.menuError(); as error) { <p class="load-error">{{ error }}</p> }
      @if (!cart.loading() && !cart.menuError()) {
        <div class="category-filters" role="group" aria-label="Filter menu by category">
          <button type="button" [attr.aria-pressed]="selectedCategory() === null" (click)="selectedCategory.set(null)">All</button>
          @for (category of categories(); track category) {
            <button type="button" [attr.aria-pressed]="selectedCategory() === category" (click)="selectedCategory.set(category)">{{ category }}</button>
          }
        </div>
        <p class="menu-results" role="status">{{ filteredMenu().length }} {{ filteredMenu().length === 1 ? 'item' : 'items' }}</p>
      }
      <div class="menu-grid">
        @for (item of filteredMenu(); track item.id) {
          <article class="menu-card">
            <img [src]="item.imageUrl" [alt]="item.name" class="menu-card-img" loading="lazy">
            <div class="menu-card-body">
              <span class="menu-card-badge">{{ item.category }}</span>
              <div class="menu-card-title"><h3>{{ item.name }}</h3><span class="menu-card-price">{{ item.price | currency:'PHP':'symbol':'1.2-2' }}</span></div>
              <p class="menu-card-desc">{{ item.description }}</p>
              <p class="stock-available" aria-live="polite">{{ item.stockAvailable == null ? 'Temporarily unavailable' : item.stockAvailable === 0 ? 'Sold out' : item.stockAvailable + ' portions available' }}</p>
              @if (quantities()[item.id]; as quantity) {
                <div class="menu-quantity" role="group" [attr.aria-label]="'Quantity of ' + item.name">
                  <button type="button" [attr.aria-label]="'Decrease ' + item.name" (click)="cart.changeQuantity(item.id, -1)">−</button>
                  <span aria-live="polite">{{ quantity }} in cart</span>
                  <button type="button" [attr.aria-label]="'Increase ' + item.name" [disabled]="!cart.canOrder() || quantity >= cart.limitFor(item.id)" (click)="cart.add(item.id)">+</button>
                </div>
              } @else {
                <button class="btn btn-primary add-to-cart-btn" type="button" [disabled]="!cart.canOrder() || !cart.limitFor(item.id)" (click)="cart.add(item.id)">{{ cart.storeOpen() === false ? 'Store closed' : cart.limitFor(item.id) ? 'Add To Order' : 'Unavailable' }}</button>
              }
            </div>
          </article>
        }
      </div>
      @if (!cart.loading() && !cart.menuError() && !filteredMenu().length) {
        <p class="load-message">No items available in this category yet.</p>
      }
      @if (cart.count() > 0) {
        <a class="mobile-cart-bar" routerLink="/cart">
          <span><strong>{{ cart.count() }} {{ cart.count() === 1 ? 'item' : 'items' }}</strong><small>Subtotal {{ cart.subtotal() | currency:'PHP':'symbol':'1.2-2' }}</small></span>
          <strong>View Cart →</strong>
        </a>
      }
    </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {
  readonly cart = inject(CartStore);
  readonly selectedCategory = signal<string | null>(null);
  readonly categories = computed(() => [...new Set(this.cart.menu().map(item => item.category))]);
  readonly filteredMenu = computed(() => this.cart.menu().filter(item => this.selectedCategory() === null || item.category === this.selectedCategory()));
  readonly quantities = computed(() => Object.fromEntries(this.cart.lines().map(line => [line.item.id, line.quantity])));
  constructor() {
    this.cart.refreshMenu();
  }
}
