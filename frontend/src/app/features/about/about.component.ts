import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  template: `
    <section class="page-section active">
      <div class="section-header"><h2>Our Legacy & BBQ History</h2><p>From a small charcoal pit in 1968 to an elevated benchmark in traditional street food artistry.</p></div>
      <div class="history-container">
        <div class="history-card">
          <h3>The Story Behind Nelia's BBQ</h3>
          <p>Founded in 1968 by Aling Nelia herself in a humble backyard, our journey began with a singular passion: creating the perfect blend of smoke, garlic, soy, and calamansi glaze.</p>
          <p>We elevate humble Filipino street food—Isaw, Tenga, Tumbong, and Adidas—without sacrificing its authentic soul and smoky roots.</p>
          <div class="timeline">
            <div class="timeline-item"><div class="timeline-year">1968</div><p>First backyard charcoal grill set up in Manila.</p></div>
            <div class="timeline-item"><div class="timeline-year">1985</div><p>Perfected our proprietary 24-hour sugarcane and banana ketchup marinade.</p></div>
            <div class="timeline-item"><div class="timeline-year">2021</div><p>Reimagined as a high-end dark lounge for true BBQ connoisseurs.</p></div>
          </div>
        </div>
      </div>
    </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {}
