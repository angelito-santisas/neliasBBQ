import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AboutComponent } from '../about/about.component';
import { FeedbackComponent } from '../feedback/feedback.component';
import { CartStore } from '../../core/cart.store';

@Component({
  imports: [RouterLink, AboutComponent, FeedbackComponent],
  template: `
    <section id="home" class="page-section active home-stack">
      <div class="hero">
        <div class="hero-spotlight-beam" aria-hidden="true"></div>
        <div class="hero-content">
          <span class="tagline">An Elevated Culinary Experience</span>
          <h1 class="hero-title">Isaw ng <span>Manok</span></h1>
          <p class="hero-desc">Experience the smoky essence of Manila's nights. Our charcoal-grilled chicken intestines are meticulously cleaned, caramelized, and finished with a unique sugarcane glaze—delivering a modern luxury interpretation of a beloved Filipino street food classic.</p>
          <div class="btn-group">
            <a class="btn btn-primary" routerLink="/menu">Explore The Menu</a>
            <a class="btn btn-outline" routerLink="/" fragment="contacts">Contact the store</a>
          </div>
        </div>
        <div class="hero-image-container">
          <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80" alt="Charcoal-grilled isaw ng manok skewers">
        </div>
      </div>
    </section>
    <div id="about" class="home-stack"><app-about /></div>
    <div id="feedback" class="home-stack"><app-feedback /></div>
    <section id="contacts" class="home-stack contacts-section" aria-labelledby="contacts-title">
      <div class="section-header"><h2 id="contacts-title">Let's talk barbecue</h2><p>Questions about your order, a visit, or a special request? Get in touch with Nelia's BBQ.</p></div>
      <div class="contact-grid">
        <article><h3>Store status</h3><p>{{ cart.storeOpen() === null ? 'Checking store status…' : cart.storeOpen() ? 'We are open for orders.' : 'We are currently closed.' }}</p><a routerLink="/menu">Browse the menu</a></article>
        <article><h3>Visit us</h3><address>Area C Bernardo Comp., Solidarity St., Annex 29–32, Betterliving, Brgy. Don Bosco, Parañaque City</address><p>Opening hours: 5:00 PM – 8:00 PM (Philippine time)</p></article>
        <article><h3>Get in touch</h3><a href="tel:+639686092324">0968 609 2324</a><a href="mailto:asantisas7@gmail.com">asantisas7&#64;gmail.com</a><a href="https://fb.com/nisa.santisas.07" target="_blank" rel="noopener noreferrer">Message us on Facebook</a></article>
      </div>
    </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly cart = inject(CartStore);
}
