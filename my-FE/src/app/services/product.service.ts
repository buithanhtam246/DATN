import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = environment.adminApiUrl || `${environment.apiUrl}/admin`;
  
  public imgBaseUrl = `${environment.assetsBaseUrl || ''}/public/images/products/`;

  public sizeGuideImgUrl = `${environment.assetsBaseUrl || ''}/uploads/size-guides/`;

  constructor(private http: HttpClient) { }

  // ========== PRODUCT MANAGEMENT ==========

  // Lấy sản phẩm
  getProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all-products`); 
  }

  // Lấy danh mục
  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories`);
  }

  // Lấy danh mục cha (Nam/Nữ)
  getParentCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/parents`);
  }

  // Lấy danh mục con theo danh mục cha
  getSubCategories(parentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/children/${parentId}`);
  }

  // Lấy thương hiệu
  getBrands(): Observable<any> {
    return this.http.get(`${this.baseUrl}/brands`);
  }

  // Thêm sản phẩm
  addProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-product`, formData);
  }

  // Cập nhật sản phẩm
  updateProduct(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/products/${id}`, formData);
  }

  // Xóa sản phẩm
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${id}`);
  }

  // ========== COLOR MANAGEMENT ==========
  
  // Lấy tất cả màu sắc
  getColors(): Observable<any> {
    return this.http.get(`${this.baseUrl}/colors`);
  }

  // Thêm màu sắc
  addColor(color: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/colors`, color);
  }

  // Cập nhật màu sắc
  updateColor(id: number, color: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/colors/${id}`, color);
  }

  // Xóa màu sắc
  deleteColor(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/colors/${id}`);
  }

  // ========== SIZE MANAGEMENT ==========

  // Lấy tất cả kích thước
  getSizes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sizes`);
  }

  // Lấy size guide theo gender (male/female)
  getSizesByGender(gender: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sizes?gender=${gender}`);
  }

  // Lấy sizes theo category
  getSizesByCategory(categoryId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/sizes/category/${categoryId}/sizes`);
  }

  // Lấy tất cả thông tin size guides (để hiển thị danh sách ảnh)
  getAllSizeGuides(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sizes/guides/all`);
  }

  // Lấy size guide theo gender
  getSizeGuide(gender: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sizes/guide/${gender}`);
  }

  // Lấy size guide theo category id
  getSizeGuideByCategory(categoryId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/sizes/category/${categoryId}/guide`);
  }

  // Thêm kích thước mới
  addSize(size: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/sizes`, size);
  }

  // Cập nhật kích thước
  updateSize(id: number, size: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/sizes/${id}`, size);
  }

  // Upload ảnh hướng dẫn size cho gender (Sử dụng FormData cho Multer Backend)
  uploadSizeGuide(gender: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/sizes/guide/${gender}/upload`, formData);
  }

  // Upload ảnh hướng dẫn size cho category
  uploadSizeGuideByCategory(categoryId: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/sizes/category/${categoryId}/upload`, formData);
  }

  // Xóa ảnh hướng dẫn size
  deleteSizeGuide(gender: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sizes/guide/${gender}`);
  }

  // Xóa ảnh hướng dẫn size theo category
  deleteSizeGuideByCategory(categoryId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sizes/category/${categoryId}/guide`);
  }

  // Xóa kích thước
  deleteSize(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sizes/${id}`);
  }

  // ========== DASHBOARD DATA ==========
  
  // Lấy sản phẩm bán chạy nhất
  getTopSellingProducts(limit: number = 5): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/top-selling-products?limit=${limit}`);
  }

  // Lấy đơn hàng gần đây
  getRecentOrders(limit: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/recent-orders?limit=${limit}`);
  }

  // Doanh thu theo ngày/tháng/năm
  getRevenueSeries(params: { groupBy: 'day' | 'month' | 'year'; year?: number; month?: number; startYear?: number; endYear?: number }): Observable<any> {
    const qs = new URLSearchParams();
    qs.set('groupBy', params.groupBy);
    if (params.year) qs.set('year', String(params.year));
    if (params.month) qs.set('month', String(params.month));
    if (params.startYear) qs.set('startYear', String(params.startYear));
    if (params.endYear) qs.set('endYear', String(params.endYear));
    const query = qs.toString();
    return this.http.get(`${this.baseUrl}/dashboard/revenue?${query}`);
  }
}