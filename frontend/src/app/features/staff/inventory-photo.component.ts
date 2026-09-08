import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { StaffApiService } from '../../core/staff-api.service';

@Component({
  selector: 'app-inventory-photo',
  template: `@if (source()) { <img [src]="source()" alt="" (error)="source.set('')"> } @else { <span aria-hidden="true">{{ name().charAt(0) }}</span> }`,
  styles: `:host { display: grid; place-items: center; width: 40px; height: 40px; flex: 0 0 40px; overflow: hidden; border: 1px solid #4b3e23; border-radius: 7px; color: #d9aa52; background: #252117; font-weight: 800; } img { width: 100%; height: 100%; object-fit: cover; }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryPhotoComponent {
  readonly url = input<string | null>(null);
  readonly name = input('');
  readonly source = signal('');
  private readonly api = inject(StaffApiService);
  constructor() {
    effect(onCleanup => {
      this.source.set('');
      const url = this.url();
      if (!url) return;
      let objectUrl = '';
      const request = this.api.getPhoto(url).subscribe({
        next: blob => { objectUrl = URL.createObjectURL(blob); this.source.set(objectUrl); },
        error: () => this.source.set('')
      });
      onCleanup(() => { request.unsubscribe(); if (objectUrl) URL.revokeObjectURL(objectUrl); });
    });
  }
}
