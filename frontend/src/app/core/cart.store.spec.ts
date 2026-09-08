import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CartStore } from './cart.store';

describe('CartStore', () => {
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); vi.useRealTimers(); });
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  });

  it('loads the menu and computes cart totals', () => {
    const store = TestBed.inject(CartStore);
    TestBed.inject(HttpTestingController).expectOne('/api/v1/menu').flush([
      { id: 'isaw', name: 'Isaw', category: 'BBQ', description: 'Smoky', imageUrl: 'image', price: 180, stockAvailable: 10 }
    ]);
    TestBed.inject(HttpTestingController).expectOne('/api/v1/store').flush({open: true});
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
    TestBed.inject(HttpTestingController).expectOne('/api/v1/store').flush({open: true});
    store.add('dish'); store.add('dish'); store.add('dish'); store.add('sold');
    expect(store.count()).toBe(2);
    store.refreshMenu();
    TestBed.inject(HttpTestingController).expectOne('/api/v1/menu').flush([{id:'dish',name:'Dish',price:20,stockAvailable:1}]);
    TestBed.inject(HttpTestingController).expectOne('/api/v1/store').flush({open: true});
    expect(store.exceedsStock()).toBe(true);
  });

  it('refreshes stock on the shared heartbeat and retains removed cart items for review', () => {
    vi.useFakeTimers();
    const store = TestBed.inject(CartStore);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/menu').flush([{id:'dish',name:'Dish',price:20,stockAvailable:2}]);
    http.expectOne('/api/v1/store').flush({open:true});
    store.add('dish');
    vi.advanceTimersByTime(15000);
    http.expectOne('/api/v1/menu').flush([]);
    http.expectOne('/api/v1/store').flush({open:true});
    expect(store.count()).toBe(1);
    expect(store.lines()[0].item.name).toBe('Dish');
    expect(store.exceedsStock()).toBe(true);
    store.remove('dish');
    expect(store.count()).toBe(0);
  });

  it('blocks orders while closed or when availability cannot be verified', () => {
    const store = TestBed.inject(CartStore);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/menu').flush([{id:'dish',name:'Dish',price:20,stockAvailable:2}]);
    http.expectOne('/api/v1/store').flush({open:false});
    store.add('dish');
    expect(store.count()).toBe(0);
    expect(store.canOrder()).toBe(false);
    store.refreshMenu();
    http.expectOne('/api/v1/store').flush({open:true});
    http.expectOne('/api/v1/menu').flush({}, {status:503,statusText:'Unavailable'});
    expect(store.canOrder()).toBe(false);
    expect(store.menuError()).toBeTruthy();
  });
});
