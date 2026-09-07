import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AdjustInventoryRequest, CreateInventoryItemRequest, InventoryItem } from '../shared/models';
import { StaffAuthService } from './staff-auth.service';

@Injectable({ providedIn: 'root' })
export class StaffApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(StaffAuthService);
  private readonly inventoryUrl = '/api/v1/staff/inventory';

  getInventory(): Observable<InventoryItem[]> {
    const headers = this.headers();
    return headers ? this.http.get<InventoryItem[]>(this.inventoryUrl, { headers }) : this.signedOut();
  }

  createInventoryItem(request: CreateInventoryItemRequest): Observable<InventoryItem> {
    const headers = this.headers();
    return headers ? this.http.post<InventoryItem>(this.inventoryUrl, request, { headers }) : this.signedOut();
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
