import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CartStore } from './core/cart.store';
import { NotificationService } from './core/notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  readonly year = new Date().getFullYear();
  private readonly router = inject(Router);
  readonly isStaffArea = signal(this.router.url.startsWith('/staff'));
  readonly cart = inject(CartStore);
  readonly notifications = inject(NotificationService);

  constructor() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.isStaffArea.set(event.urlAfterRedirects.startsWith('/staff')));
  }
}
