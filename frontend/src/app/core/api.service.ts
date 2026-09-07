import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreatedResource, FeedbackRequest, MenuItem, OrderRequest, OrderResponse } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1';

  getMenu(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/menu`);
  }

  createOrder(request: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.baseUrl}/orders`, request);
  }

  createFeedback(request: FeedbackRequest): Observable<CreatedResource> {
    return this.http.post<CreatedResource>(`${this.baseUrl}/feedback`, request);
  }
}
