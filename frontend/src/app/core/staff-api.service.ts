import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AdjustInventoryRequest, CreateInventoryItemRequest, InventoryItem } from '../shared/models';
import { StaffAuthService } from './staff-auth.service';
import { MenuItem, OrderResponse } from '../shared/models';

export interface StaffMenuItem extends MenuItem { active: boolean; version: number; }
export interface CreateMenuItemRequest { name: string; category: string; description: string; price: number; active: boolean; stockAvailable: number; }
export interface UpdateMenuItemRequest extends CreateMenuItemRequest { version: number; }
export interface StaffOrder extends OrderResponse { createdAt: string; items: Array<{menuItemId:string; name:string; unitPrice:number; quantity:number; lineTotal:number}>; }

@Injectable({ providedIn: 'root' })
export class StaffApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(StaffAuthService);
  private readonly inventoryUrl = '/api/v1/staff/inventory';

  setStoreOpen(open: boolean): Observable<{ open: boolean }> {
    const headers = this.headers();
    return headers ? this.http.put<{ open: boolean }>('/api/v1/staff/store', { open }, { headers }) : this.signedOut();
  }

  getInventory(): Observable<InventoryItem[]> {
    const headers = this.headers();
    return headers ? this.http.get<InventoryItem[]>(this.inventoryUrl, { headers }) : this.signedOut();
  }

  getMenu(): Observable<StaffMenuItem[]> {
    const headers = this.headers();
    return headers ? this.http.get<StaffMenuItem[]>('/api/v1/staff/menu', { headers }) : this.signedOut();
  }

  getPendingOrders(number = ''): Observable<StaffOrder[]> {
    const headers = this.headers();
    return headers ? this.http.get<StaffOrder[]>('/api/v1/staff/orders', {headers, params: number.trim() ? { number: number.trim() } : {}}) : this.signedOut();
  }

  confirmOrder(id: string): Observable<StaffOrder> {
    const headers = this.headers();
    return headers ? this.http.post<StaffOrder>(`/api/v1/staff/orders/${encodeURIComponent(id)}/confirm`, {}, {headers}) : this.signedOut();
  }

  cancelOrder(id: string): Observable<StaffOrder> {
    const headers = this.headers();
    return headers ? this.http.post<StaffOrder>(`/api/v1/staff/orders/${encodeURIComponent(id)}/cancel`, {}, {headers}) : this.signedOut();
  }

  updateMenuItem(id: string, request: UpdateMenuItemRequest, photo?: File | null): Observable<StaffMenuItem> {
    const headers = this.headers();
    if (!headers) return this.signedOut();
    const url = `/api/v1/staff/menu/${encodeURIComponent(id)}`;
    if (!photo) return this.http.put<StaffMenuItem>(url, request, {headers});
    const body = new FormData();
    body.append('item', new Blob([JSON.stringify(request)], {type: 'application/json'}));
    body.append('photo', photo);
    return this.http.put<StaffMenuItem>(url, body, {headers});
  }

  createMenuItem(request: CreateMenuItemRequest, photo?: File | null): Observable<StaffMenuItem> {
    const headers = this.headers();
    if (!headers) return this.signedOut();
    const url = '/api/v1/staff/menu';
    if (!photo) return this.http.post<StaffMenuItem>(url, request, {headers});
    const body = new FormData();
    body.append('item', new Blob([JSON.stringify(request)], {type: 'application/json'}));
    body.append('photo', photo);
    return this.http.post<StaffMenuItem>(url, body, {headers});
  }

  getPhoto(url: string): Observable<Blob> {
    const headers = this.headers();
    if (!/^\/api\/v1\/staff\/photos\/[0-9a-f-]{36}$/i.test(url)) return throwError(() => new Error('Invalid photo URL.'));
    return headers ? this.http.get(url, { headers, responseType: 'blob' }) : this.signedOut();
  }

  createInventoryItem(request: CreateInventoryItemRequest, photo?: File | null): Observable<InventoryItem> {
    const headers = this.headers();
    if (!headers) return this.signedOut();
    if (!photo) return this.http.post<InventoryItem>(this.inventoryUrl, request, { headers });
    const body = new FormData();
    body.append('item', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    body.append('photo', photo);
    return this.http.post<InventoryItem>(this.inventoryUrl, body, { headers });
  }

  adjustInventory(id: string, request: AdjustInventoryRequest): Observable<InventoryItem> {
    const headers = this.headers();
    return headers ? this.http.patch<InventoryItem>(`${this.inventoryUrl}/${id}/stock`, request, { headers }) : this.signedOut();
  }

  private headers(): HttpHeaders | null {
    const token = this.auth.accessToken;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : null;
  }

  private signedOut<T>(): Observable<T> {
    return throwError(() => new Error('Staff session has ended.'));
  }
}
