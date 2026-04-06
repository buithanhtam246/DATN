import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  constructor(private apiService: ApiService) {}

  /**
   * Tạo đánh giá sản phẩm
   */
  createReview(orderDetailId: number, rating: number, comment: string): Observable<any> {
    return this.apiService.createReview({
      order_detail_id: orderDetailId,
      rating: Math.round(rating),
      comment: comment.trim()
    });
  }

  /**
   * Lấy đánh giá sản phẩm
   */
  getProductReviews(variantId: number, page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.getProductReviews(variantId, page, limit);
  }

  /**
   * Lấy đánh giá đơn hàng
   */
  getOrderReviews(orderId: number): Observable<any> {
    return this.apiService.getOrderReviews(orderId);
  }

  /**
   * Cập nhật đánh giá
   */
  updateReview(reviewId: number, rating: number, comment: string): Observable<any> {
    return this.apiService.updateReview(reviewId, {
      rating: Math.round(rating),
      comment: comment.trim()
    });
  }

  /**
   * Xóa đánh giá
   */
  deleteReview(reviewId: number): Observable<any> {
    return this.apiService.deleteReview(reviewId);
  }
}
