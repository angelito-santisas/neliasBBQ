import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-feedback',
  imports: [ReactiveFormsModule],
  template: `
    <section class="page-section active">
      <div class="section-header"><h2>Share Your Experience</h2><p>Your valued feedback helps us continually refine our craft and hospitality.</p></div>
      <div class="feedback-form-container">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="rating-group">
            <span class="rating-label" id="overall-label">Overall Experience</span>
            <div class="overall-stars" role="radiogroup" aria-labelledby="overall-label" (mouseleave)="hoverRating.set(null)">
              @for (rating of starRatings; track rating) {
                <label class="rating-star" [class.shaded]="rating <= (hoverRating() ?? form.controls.overallRating.value ?? 0)" (mouseenter)="hoverRating.set(rating)">
                  <input type="radio" name="overallRating" formControlName="overallRating" [value]="rating" [attr.aria-label]="rating + (rating === 1 ? ' star' : ' stars')">
                  <span aria-hidden="true">&#9733;</span>
                </label>
              }
            </div>
          </div>
          @if (form.controls.overallRating.touched && form.controls.overallRating.invalid) { <span class="field-error show">Please select an overall rating.</span> }
          <div class="rating-group">
            <span class="rating-label" id="food-quality-label">Food Quality & Flavor (optional)</span>
            <div class="overall-stars" role="radiogroup" aria-labelledby="food-quality-label" (mouseleave)="foodHoverRating.set(null)">
              @for (rating of starRatings; track rating) {
                <label class="rating-star" [class.shaded]="rating <= (foodHoverRating() ?? form.controls.foodQualityRating.value ?? 0)" (mouseenter)="foodHoverRating.set(rating)">
                  <input type="radio" name="foodQualityRating" formControlName="foodQualityRating" [value]="rating" [attr.aria-label]="rating + (rating === 1 ? ' star' : ' stars')">
                  <span aria-hidden="true">&#9733;</span>
                </label>
              }
            </div>
          </div>
          <div class="form-group"><label>Would you recommend Nelia's BBQ?</label><div class="radio-group"><label class="radio-option"><input type="radio" formControlName="wouldRecommend" [value]="true"> Yes</label><label class="radio-option"><input type="radio" formControlName="wouldRecommend" [value]="false"> Needs improvement</label></div></div>
          <div class="form-group"><label for="comments">Add Your Comments</label><textarea id="comments" rows="4" maxlength="1000" formControlName="comments"></textarea></div>
          <div class="toggle-container"><label for="anonymous">Submit Anonymously</label><input id="anonymous" type="checkbox" formControlName="anonymous"></div>
          <button type="submit" class="btn btn-primary full-width" [disabled]="submitting()">{{ submitting() ? 'Submitting…' : 'Submit Feedback' }}</button>
        </form>
      </div>
    </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackComponent {
  private readonly api = inject(ApiService);
  private readonly notifications = inject(NotificationService);
  readonly starRatings = [1, 2, 3, 4, 5];
  readonly hoverRating = signal<number | null>(null);
  readonly foodHoverRating = signal<number | null>(null);
  readonly submitting = signal(false);
  readonly form = new FormGroup({
    overallRating: new FormControl<number | null>(null, Validators.required),
    foodQualityRating: new FormControl<number | null>(null),
    wouldRecommend: new FormControl(true, { nonNullable: true }),
    comments: new FormControl('', { nonNullable: true, validators: Validators.maxLength(1000) }),
    anonymous: new FormControl(false, { nonNullable: true })
  });

  submit(): void {
    const value = this.form.getRawValue();
    if (this.form.invalid || value.overallRating === null) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.api.createFeedback({
      overallRating: value.overallRating,
      foodQualityRating: value.foodQualityRating,
      wouldRecommend: value.wouldRecommend,
      comments: value.comments,
      anonymous: value.anonymous
    }).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => { this.form.reset({ overallRating: null, foodQualityRating: null, wouldRecommend: true, comments: '', anonymous: false }); this.notifications.show('Thank you for your feedback!'); },
      error: () => this.notifications.show('Feedback could not be submitted. Please try again.')
    });
  }
}
