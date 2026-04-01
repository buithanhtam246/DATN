import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Thành dòng này:
  private apiUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}
  // ... các hàm bên dưới giữ nguyên

  // Lấy token từ localStorage
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ============ AUTH ENDPOINTS (USER) ============
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  // ============ ADMIN AUTH ENDPOINTS ============
  adminLogin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/admin-login`, data);
  }

  adminVerifyToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify`, {}, { headers: this.getAuthHeaders() });
  }

  adminLogout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/admin-logout`, {}, { headers: this.getAuthHeaders() });
  }

  // ============ CART ENDPOINTS ============
  createCart(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/create`, { user_id: userId });
  }

  getCart(cartId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart?cart_id=${cartId}`);
  }

  addToCart(cartId: number, variantId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/add`, {
      cart_id: cartId,
      variant_id: variantId,
      quantity: quantity
    });
  }

  updateCartItem(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cart/update/${itemId}`, { quantity });
  }

  removeFromCart(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/remove/${itemId}`);
  }

  clearCart(cartId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/clear`, { body: { cart_id: cartId } });
  }

  getCartTotal(cartId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart/total?cart_id=${cartId}`);
  }

  // ============ ORDER ENDPOINTS ============
  checkout(orderData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/orders/checkout`,
      orderData,
      { headers: this.getAuthHeaders() }
    );
  }

        // Thêm phương thức addReview
        addReview(reviewData: any): Observable<any> {
          return this.http.post(
            `${this.apiUrl}/reviews/create`,
            reviewData,
            { headers: this.getAuthHeaders() }
          );
        }
  // ============ ORDER HISTORY ENDPOINTS ============
  getOrderHistory(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/orders/history`,
      { headers: this.getAuthHeaders() }
    );
  }

  getOrderDetail(orderId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/orders/history/${orderId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getOrderTimeline(orderId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/orders/history/${orderId}/timeline`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============ REVIEW ENDPOINTS ============
  createReview(reviewData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/reviews/create`,
      reviewData,
      { headers: this.getAuthHeaders() }
    );
  }

  getProductReviews(variantId: number, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/reviews/product?variant_id=${variantId}&page=${page}&limit=${limit}`
    );
  }

  getOrderReviews(orderId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/reviews/order/${orderId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateReview(reviewId: number, reviewData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/reviews/update/${reviewId}`,
      reviewData,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/reviews/delete/${reviewId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============ ADDRESS ENDPOINTS ============
  createAddress(addressData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/addresses`,
      addressData,
      { headers: this.getAuthHeaders() }
    );
  }

  getAddresses(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/addresses`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============ VOUCHER ENDPOINTS ============
  getVouchers(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/admin/vouchers`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============ PRODUCT ENDPOINTS ============
  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/all-products`);
  }

  getProductById(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/products/${productId}`);
  }

  // ============ ADMIN USER ENDPOINTS ============
  getAllUsers(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/admin/users`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============ ADMIN REVIEW ENDPOINTS ============
  getAllReviews(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/reviews`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ============ ADMIN ORDER ENDPOINTS ============
  getAllOrders(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/admin/orders`,
      { headers: this.getAuthHeaders() }
    );
  }
}
