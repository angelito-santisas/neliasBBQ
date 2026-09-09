import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FeedbackComponent } from './feedback.component';

describe('FeedbackComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('requires an order number and removes anonymous submission', () => {
    const fixture = TestBed.createComponent(FeedbackComponent);
    fixture.componentInstance.form.controls.overallRating.setValue(5);
    fixture.componentInstance.submit();
    TestBed.inject(HttpTestingController).expectNone('/api/v1/feedback');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Submit Anonymously');
    expect(fixture.nativeElement.querySelector('#feedback-order-number')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Enter a valid order number.');
  });

  it('resets after success, prevents double clicks, and displays a repeated-order error', () => {
    const fixture = TestBed.createComponent(FeedbackComponent);
    const component = fixture.componentInstance;
    const http = TestBed.inject(HttpTestingController);
    component.form.patchValue({ overallRating: 5, orderNumber: 'ABCDEF12' });
    component.submit(); component.submit();
    const request = http.expectOne('/api/v1/feedback');
    expect(request.request.body.orderNumber).toBe('ABCDEF12');
    expect(request.request.body.anonymous).toBeUndefined();
    expect(component.form.disabled).toBe(true);
    request.flush({ id: 'feedback-id' });
    expect(component.form.controls.orderNumber.value).toBe('');
    expect(component.form.enabled).toBe(true);
    component.form.patchValue({ overallRating: 4, orderNumber: 'ABCDEF12' });
    component.submit();
    http.expectOne('/api/v1/feedback').flush({ detail: 'Feedback has already been submitted for this order number.' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('already been submitted');
    expect(component.form.controls.orderNumber.value).toBe('ABCDEF12');
    expect(component.submitting()).toBe(false);
  });
});
