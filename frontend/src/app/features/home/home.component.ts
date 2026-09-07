import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/notification.service';

@Component({
  imports: [RouterLink],
  template: `
    <section class="page-section active">
      <div class="hero">
        <div class="hero-spotlight-beam" aria-hidden="true"></div>
        <div class="hero-content">
          <span class="tagline">An Elevated Culinary Experience</span>
          <h1 class="hero-title">Isaw ng <span>Manok</span></h1>
          <p class="hero-desc">Experience the smoky essence of Manila's nights. Our charcoal-grilled chicken intestines are meticulously cleaned, caramelized, and finished with a unique sugarcane glaze—delivering a modern luxury interpretation of a beloved Filipino street food classic.</p>
          <div class="btn-group">
            <a class="btn btn-primary" routerLink="/menu">Explore The Menu</a>
            <button class="btn btn-outline" type="button" (click)="bookTable()">Book A Table</button>
          </div>
        </div>
        <div class="hero-image-container">
          <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80" alt="Charcoal-grilled isaw ng manok skewers">
        </div>
      </div>
    </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private readonly notifications = inject(NotificationService);
  bookTable(): void { this.notifications.show('Table reservation feature coming soon!'); }
}
