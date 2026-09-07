import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CartStore } from './cart.store';

describe('CartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  });

  it('loads the menu and computes cart totals', () => {
    const store = TestBed.inject(CartStore);
    TestBed.inject(HttpTestingController).expectOne('/api/v1/menu').flush([
      { id: 'isaw', name: 'Isaw', category: 'BBQ', description: 'Smoky', imageUrl: 'image', price: 180 }
    ]);
    store.add('isaw');
    store.add('isaw');
    expect(store.count()).toBe(2);
    expect(store.subtotal()).toBe(360);
  });
});
