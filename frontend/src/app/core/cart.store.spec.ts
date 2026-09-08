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
      { id: 'isaw', name: 'Isaw', category: 'BBQ', description: 'Smoky', imageUrl: 'image', price: 180, stockAvailable: 10 }
    ]);
    store.add('isaw');
    store.add('isaw');
    expect(store.count()).toBe(2);
    expect(store.subtotal()).toBe(360);
  });
  it('limits cart quantities to available portions and blocks sold-out items', () => {
    const store = TestBed.inject(CartStore);
    TestBed.inject(HttpTestingController).expectOne('/api/v1/menu').flush([
      {id:'dish', name:'Dish', price:20, stockAvailable:2}, {id:'sold', name:'Sold out', price:20, stockAvailable:0}
    ]);
    store.add('dish'); store.add('dish'); store.add('dish'); store.add('sold');
    expect(store.count()).toBe(2);
    store.refreshMenu();
    TestBed.inject(HttpTestingController).expectOne('/api/v1/menu').flush([{id:'dish',name:'Dish',price:20,stockAvailable:1}]);
    expect(store.exceedsStock()).toBe(true);
  });
});
