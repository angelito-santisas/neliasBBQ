import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  template: `
    <section class="page-section active policy-page">
      <div class="section-header"><h1>Privacy & ordering policy</h1><p>Information for customers of Nelia's BBQ.</p></div>
      <article id="privacy" class="home-stack">
        <h2>Privacy</h2>
        <p>When you place an order, we record the selected products, quantities, prices, time, and special instructions so our staff can handle your order. Feedback includes the ratings, comments, recommendation choice, and anonymity preference you submit.</p>
        <p>Your cart quantities are saved in this browser so you can return to your order. Remove items or clear your browser's site data to clear that saved cart. Staff sign-in is for authorized staff accounts; its session is kept in memory and cleared on refresh or sign-out.</p>
        <p>This site uses externally hosted fonts and images. Their providers receive the network information needed to deliver those resources. Following a Facebook link takes you to Facebook, which has its own privacy policy.</p>
        <p>Please avoid including sensitive personal information in feedback or order instructions. For questions about your information, or to request a correction or deletion, email <a href="mailto:asantisas7@gmail.com">asantisas7&#64;gmail.com</a>.</p>
      </article>
      <article id="ordering" class="home-stack">
        <h2>Ordering & availability</h2>
        <p>Prices are shown in Philippine pesos. The cart displays the service and packaging fee before submission. Availability is refreshed periodically and checked again when you submit an order.</p>
        <p>Submitting an order sends it to staff for confirmation. It does not reserve stock. Staff confirmation depends on the remaining portions; a pending order may be unavailable if those portions sell out.</p>
        <p>New orders cannot be submitted while the store is marked closed. Our listed opening hours are 5:00 PM to 8:00 PM, Philippine time. Check the current store status before ordering.</p>
        <p>For order changes, cancellation requests, payment or pickup questions, and any food concerns, contact the store at <a href="tel:+639686092324">0968 609 2324</a>. Please speak with staff about allergies before ordering.</p>
      </article>
      <a class="btn btn-outline" routerLink="/" fragment="contacts">Store contacts</a>
    </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PoliciesComponent {}
