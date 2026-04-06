import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  constructor(private apiService: ApiService) {}

  getOrderHistory(): Observable<any> {
    return this.apiService.getOrderHistory();
  }

  getOrderDetail(orderId: number): Observable<any> {
    return this.apiService.getOrderDetail(orderId);
  }

  getOrderTimeline(orderId: number): Observable<any> {
    return this.apiService.getOrderTimeline(orderId);
  }

  addReview(reviewData: any): Observable<any> {
    return this.apiService.addReview(reviewData);
  }

  updateReview(reviewId: number, reviewData: any): Observable<any> {
    return this.apiService.updateReview(reviewId, reviewData);
  }

  checkout(orderData: any): Observable<any> {
    return this.apiService.checkout(orderData);
  }
}
