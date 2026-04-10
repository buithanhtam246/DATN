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

  // Login with Google ID token. Backend should verify token and return auth token + user.
  googleLogin(idToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/google`, { idToken });
  }

  // ============ ADMIN AUTH ENDPOINTS ============
  adminLogin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/admin/login`, data);
  }

  adminVerifyToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/admin/verify`, {}, { headers: this.getAuthHeaders() });
  }

  adminLogout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/admin/logout`, {}, { headers: this.getAuthHeaders() });
  }

  // ============ CART ENDPOINTS ============
  createCart(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/create`, { user_id: userId }, { headers: this.getAuthHeaders() });
  }

  getCart(cartId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart?cart_id=${cartId}`, { headers: this.getAuthHeaders() });
  }

  addToCart(cartId: number, variantId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/add`, {
      cart_id: cartId,
      variant_id: variantId,
      quantity: quantity
    }, { headers: this.getAuthHeaders() });
  }

  updateCartItem(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cart/update/${itemId}`, { quantity }, { headers: this.getAuthHeaders() });
  }

  removeFromCart(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/remove/${itemId}`, { headers: this.getAuthHeaders() });
  }

  clearCart(cartId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/clear`, { body: { cart_id: cartId }, headers: this.getAuthHeaders() });
  }

  getCartTotal(cartId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart/total?cart_id=${cartId}`, { headers: this.getAuthHeaders() });
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

  updateReviewStatus(reviewId: number, status: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/reviews/${reviewId}/status`,
      { status },
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

  // Lấy danh sách voucher có sẵn cho user
  getAvailableVouchers(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/vouchers/available`
    );
  }

  // Kiểm tra voucher và tính discount
  checkVoucher(code: string, totalPrice: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/vouchers/check`,
      { code, totalPrice }
    );
  }

  // Lấy chi tiết voucher
  getVoucherDetail(code: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/vouchers/detail/${code}`
    );
  }
// ============ PRODUCT ENDPOINTS ============
  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`);
  }

  getProductById(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${productId}`);
  }

  // ============ FAVORITE ENDPOINTS ============
  getFavorites(): Observable<any> {
    return this.http.get(`${this.apiUrl}/favorites`, { headers: this.getAuthHeaders() });
  }

  addFavorite(productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/favorites/create`, { product_id: productId }, { headers: this.getAuthHeaders() });
  }

  removeFavorite(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/favorites/${productId}`, { headers: this.getAuthHeaders() });
  }

  getVariantsInventory(variantIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/products/inventory`, {
      variant_ids: variantIds
    });
  }

  searchProducts(keyword?: string, categoryId?: number, brandId?: number): Observable<any> {
    let query = `${this.apiUrl}/products/search?`;
    if (keyword) query += `keyword=${keyword}&`;
    if (categoryId) query += `category_id=${categoryId}&`;
    if (brandId) query += `brand_id=${brandId}`;
    return this.http.get(query);
  }

  // ============ ADMIN USER ENDPOINTS ============
  getAllUsers(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/admin/users`,
      { headers: this.getAuthHeaders() }
    );
  }

  lockUser(userId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/admin/users/${userId}/lock`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  unlockUser(userId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/admin/users/${userId}/unlock`,
      {},
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

  getAdminOrderDetail(orderId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/admin/orders/${orderId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/admin/orders/${orderId}/status`,
      { status },
      { headers: this.getAuthHeaders() }
    );
  }
}
