import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { StaffApiService, StaffMenuItem } from '../../core/staff-api.service';

@Component({
  selector: 'app-menu-editor', imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog aria-labelledby="edit-menu-title" (cancel)="cancel($event)">
      <div class="editor-heading"><h2 id="edit-menu-title">{{ isNew() ? 'Add product' : 'Edit menu item' }}</h2><button type="button" aria-label="Close editor" (click)="close()" [disabled]="saving()">×</button></div>
      <form [formGroup]="form" (ngSubmit)="save()">
        <label class="full">Title<input formControlName="name" maxlength="120" required></label>
        <div class="full"><label for="menu-category">Category</label><select id="menu-category" formControlName="category" required>@for (category of categoryOptions(); track category) { <option [value]="category">{{ category }}</option> }</select></div>
        <label class="full">Description<textarea formControlName="description" rows="3" maxlength="500" required></textarea></label>
        <label>Price (₱)<input type="number" formControlName="price" min="0" max="99999999.99" step="0.01" required></label>
        <label>Stock available<input type="number" formControlName="stockAvailable" min="0" max="1000000" step="1" required><small>Whole portions remaining. Set 0 for sold out.</small></label>
        <label class="checkbox full"><input type="checkbox" formControlName="active">Show on customer menu</label>
        <div class="full picture-field">
          <label for="menu-picture">Picture</label>
          <img [src]="preview() || item().imageUrl" alt="Menu picture preview" (error)="$any($event.target).style.visibility = 'hidden'" (load)="$any($event.target).style.visibility = 'visible'">
          <input #pictureInput id="menu-picture" type="file" accept="image/jpeg,image/png" (change)="selectPicture($event)" [disabled]="saving()" aria-describedby="picture-help">
          <small id="picture-help">Upload JPG or PNG, up to 2 MB and 12 megapixels. {{ isNew() ? 'Optional — you can add a picture later.' : 'Your current picture stays unless you choose a replacement.' }}</small>
          @if (preview()) { <button type="button" (click)="clearPicture(); pictureInput.value = ''" [disabled]="saving()">{{ isNew() ? 'Remove picture' : 'Keep current picture' }}</button> }
          @if (photoError()) { <p role="alert">{{ photoError() }}</p> }
        </div>
        @if (error()) { <p class="full error" role="alert">{{ error() }}</p> }
        @if (form.invalid) { <p class="full hint">Enter a title, description, valid price, and a whole stock count to save.</p> }
        <div class="full editor-actions"><button type="button" (click)="close()" [disabled]="saving()">Cancel</button><button class="save" type="submit" [disabled]="saving() || form.invalid || !!photoError()">{{ saving() ? 'Saving…' : (isNew() ? 'Add product' : 'Save changes') }}</button></div>
      </form>
    </dialog>`,
  styleUrl: './menu-editor.component.css'
})
export class MenuEditorComponent {
  readonly item = input.required<StaffMenuItem>();
  readonly categories = input<string[]>([]);
  readonly isNew = computed(() => !this.item().id);
  readonly categoryOptions = computed(() => [...new Set(['Classics', 'Offal Delights', 'Specialty Dipping Sauces', 'Sides', 'Drinks', 'Desserts', ...this.categories(), this.item().category].filter(Boolean))]);
  readonly saved = output<StaffMenuItem>();
  readonly dismissed = output<void>();
  readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly api = inject(StaffApiService);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly photoError = signal('');
  readonly preview = signal('');
  private photo: File | null = null;
  readonly form = new FormGroup({
    name: new FormControl('', {nonNullable:true, validators:[Validators.required, Validators.maxLength(120), Validators.pattern(/\S/)]}),
    category: new FormControl('Classics', {nonNullable:true, validators:[Validators.required, Validators.maxLength(80)]}),
    description: new FormControl('', {nonNullable:true, validators:[Validators.required, Validators.maxLength(500), Validators.pattern(/\S/)]}),
    price: new FormControl(0, {nonNullable:true, validators:[Validators.required, Validators.min(0), Validators.max(99999999.99), Validators.pattern(/^\d+(\.\d{1,2})?$/)]}),
    stockAvailable: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(1000000), Validators.pattern(/^\d+$/)]),
    active: new FormControl(true, {nonNullable:true})
  });
  constructor() {
    afterNextRender(() => { this.form.reset(this.item()); this.dialog().nativeElement.showModal(); });
    inject(DestroyRef).onDestroy(() => this.clearPicture());
  }
  selectPicture(event: Event): void {
    const field = event.target as HTMLInputElement;
    const photo = field.files?.[0]; this.clearPicture();
    if (!photo) return;
    if (!['image/jpeg','image/png'].includes(photo.type) || photo.size === 0 || photo.size > 2 * 1024 * 1024) {
      this.photoError.set('Choose a JPG or PNG picture up to 2 MB.'); field.value = ''; return;
    }
    this.photo = photo; this.preview.set(URL.createObjectURL(photo));
  }
  clearPicture(): void {
    if (this.preview()) URL.revokeObjectURL(this.preview());
    this.photo = null; this.preview.set(''); this.photoError.set('');
  }
  cancel(event: Event): void { event.preventDefault(); this.close(); }
  close(): void { if (!this.saving()) { this.dialog().nativeElement.close(); this.dismissed.emit(); } }
  save(): void {
    if (this.saving() || this.form.invalid || this.photoError()) return;
    if (!this.isNew() && !Number.isInteger(this.item().version)) {
      this.error.set('This menu was loaded before the server update. Close the editor, click Refresh menu, and reopen the item.'); return;
    }
    const value = this.form.getRawValue();
    if (value.stockAvailable === null) return;
    this.saving.set(true); this.error.set('');
    const request = {...value, stockAvailable:value.stockAvailable};
    const save = this.isNew() ? this.api.createMenuItem(request, this.photo)
      : this.api.updateMenuItem(this.item().id, {...request, version:this.item().version}, this.photo);
    save
      .pipe(finalize(() => this.saving.set(false))).subscribe({
        next: item => { this.dialog().nativeElement.close(); this.saved.emit(item); },
        error: err => this.error.set(err?.error?.detail || (err.status === 401 || err.status === 403
          ? 'Your staff session has expired or this request was denied. Sign in again and retry.'
          : err.status === 400 ? 'Check the title, description, price, and stock count. Refresh the menu if this editor was already open during a server update.'
          : 'Changes could not be saved. Check your connection and try again.'))
      });
  }
}
