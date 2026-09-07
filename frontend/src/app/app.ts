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
  private readonly router = inject(Router);
  readonly isStaffArea = signal(this.router.url.startsWith('/staff'));
  private titleClicks = 0;
  private lastTitleClick = 0;
  onTitleClick(event: MouseEvent): void {
    event.preventDefault();
    const now = Date.now();
    this.titleClicks = now - this.lastTitleClick > 3000 ? 1 : this.titleClicks + 1;
    this.lastTitleClick = now;
    if (this.titleClicks >= 8) {
      this.titleClicks = 0;
      void this.router.navigateByUrl('/staff');
    } else {
      void this.router.navigateByUrl('/');
    }
  }
  readonly cart = inject(CartStore);
  readonly notifications = inject(NotificationService);

  constructor() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.isStaffArea.set(event.urlAfterRedirects.startsWith('/staff')));
  }
}
