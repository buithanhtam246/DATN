import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/api/users';
  private addressesUrl = 'http://localhost:3000/api/addresses';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('UserService - Token:', token ? 'exists' : 'not found');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Lấy thông tin tài khoản (không có địa chỉ)
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  // Lấy thông tin tài khoản kèm địa chỉ mặc định
  getProfileWithAddress(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile-with-address`, { headers: this.getHeaders() });
  }

  // Cập nhật thông tin tài khoản
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data, { headers: this.getHeaders() });
  }

  // Lấy danh sách địa chỉ
  getAddresses(): Observable<any> {
    return this.http.get(`${this.addressesUrl}`, { headers: this.getHeaders() });
  }

  // Thêm địa chỉ mới
  addAddress(addressData: any): Observable<any> {
    return this.http.post(`${this.addressesUrl}`, addressData, { headers: this.getHeaders() });
  }

  // Cập nhật địa chỉ
  updateAddress(addressData: any): Observable<any> {
    return this.http.put(`${this.addressesUrl}/${addressData.id}`, addressData, { headers: this.getHeaders() });
  }

  // Xóa địa chỉ
  deleteAddress(addressId: number): Observable<any> {
    return this.http.delete(`${this.addressesUrl}/${addressId}`, { headers: this.getHeaders() });
  }

  // Lấy danh sách đơn hàng
  getOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders`, { headers: this.getHeaders() });
  }

  // Lấy chi tiết đơn hàng
  getOrderDetails(orderId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}`, { headers: this.getHeaders() });
  }

  // Lấy danh sách review
  getReviews(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews`, { headers: this.getHeaders() });
  }

  // Thêm review
  addReview(reviewData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, reviewData, { headers: this.getHeaders() });
  }

  // Cập nhật review
  updateReview(reviewId: number, reviewData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reviews/${reviewId}`, reviewData, { headers: this.getHeaders() });
  }

  // Xóa review
  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`, { headers: this.getHeaders() });
  }

  // Đổi mật khẩu
  changePassword(passwordData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, passwordData, { headers: this.getHeaders() });
  }
}
