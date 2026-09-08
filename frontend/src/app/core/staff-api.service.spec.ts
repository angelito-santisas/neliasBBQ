import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StaffApiService } from './staff-api.service';
import { StaffAuthService } from './staff-auth.service';

describe('StaffApiService', () => {
  let api: StaffApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting(),
      {provide: StaffAuthService, useValue: {accessToken: 'test-token'}}]});
    api = TestBed.inject(StaffApiService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('creates a menu product with its category through the authenticated API', () => {
    const item = {name:'New product', category:'Classics', description:'Description', price:50, active:true, stockAvailable:10};
    api.createMenuItem(item).subscribe();
    const req = http.expectOne('/api/v1/staff/menu');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.category).toBe('Classics');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({...item,id:'new',version:0,imageUrl:'/menu-placeholder.svg'});
  });

  it('sends photo and item together without overriding the multipart boundary', () => {
    const item = {name: 'Rice', sku: 'RICE', category: 'Grains', unit: 'kg', quantity: 2, reorderLevel: 1, unitCost: 50};
    const file = new File(['photo'], 'rice.png', {type: 'image/png'});
    api.createInventoryItem(item, file).subscribe();
    const req = http.expectOne('/api/v1/staff/inventory');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    expect(req.request.headers.has('Content-Type')).toBe(false);
    expect(req.request.body instanceof FormData).toBe(true);
    expect(req.request.body.get('photo').name).toBe('rice.png');
    expect(req.request.body.get('item').type).toBe('application/json');
    req.flush({ ...item, id: '1', imageUrl: null });
  });

  it('never sends a staff token to an arbitrary photo URL', () => {
    let rejected = false;
    api.getPhoto('https://example.com/photo').subscribe({error: () => rejected = true});
    expect(rejected).toBe(true);
    http.expectNone('https://example.com/photo');
  });

  it('loads the existing menu through the staff API', () => {
    api.getMenu().subscribe(items => expect(items.length).toBe(1));
    const req = http.expectOne('/api/v1/staff/menu');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush([{id: 'isaw', name: 'Isaw', active: true}]);
  });
});
