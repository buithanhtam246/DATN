import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
<<<<<<< HEAD
import { HttpClient } from '@angular/common/http';
import { Product } from '../models';
import { FEATURED_PRODUCT } from '../constants';
import { IProductOperations } from '../interfaces/service.interface';
import { environment } from '../../../environments/environment';
=======
import { Product } from '../models';
import { FEATURED_PRODUCT } from '../constants';
import { IProductOperations } from '../interfaces/service.interface';
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284

/**
 * Service quản lý products
 * Single Responsibility: Chỉ quản lý product data
 * Implements: IProductOperations
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService implements IProductOperations {
<<<<<<< HEAD
  private apiUrl = environment.apiUrl.replace('/api', '') + '/api/products';
  private baseUrl = environment.apiUrl.replace('/api', '');
  
  constructor(private http: HttpClient) {}
=======
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
  
  /**
   * Lấy featured product
   * Implementation of IProductOperations
   */
  getFeaturedProduct(): Product {
    return FEATURED_PRODUCT;
  }

  /**
   * Lấy featured product as Observable
   */
  getFeaturedProduct$(): Observable<Product> {
    return of(FEATURED_PRODUCT);
  }

  /**
   * Lấy products theo category
   * Implementation of IProductOperations
   */
  getProductsByCategory(category: string): Product[] {
    // TODO: Implement khi có API
    return [FEATURED_PRODUCT];
  }

  /**
   * Lấy danh sách products
   * TODO: Kết nối với API thực tế
   */
<<<<<<< HEAD
  getProducts(params?: any): Observable<any> {
    return this.http.get(`http://localhost:3000/api/admin/all-products`, { params });
=======
  getProducts(): Observable<Product[]> {
    return of([FEATURED_PRODUCT]);
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
  }

  /**
   * Lấy product theo ID
   */
<<<<<<< HEAD
  getProductById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Lấy sản phẩm gợi ý (recommended products)
   */
  getRecommendedProducts(limit: number = 4, categoryId?: number, excludeId?: number): Observable<any[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('limit', String(limit));
    queryParams.set('sort', 'newest');

    if (categoryId) {
      queryParams.set('category_id', String(categoryId));
    }

    if (excludeId) {
      queryParams.set('exclude_id', String(excludeId));
    }

    return this.http.get<any[]>(`${this.apiUrl}?${queryParams.toString()}`);
=======
  getProductById(id: string): Observable<Product | undefined> {
    // TODO: Implement khi có API
    return of(FEATURED_PRODUCT);
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
  }

  /**
   * Format giá tiền
   */
  formatPrice(price: string): string {
    return price;
  }
<<<<<<< HEAD

  // ========== SIZE GUIDE METHODS ==========
  /**
   * Get size guide image for a category
   */
  getSizeGuideByCategory(categoryId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/size-guides/category/${categoryId}`);
  }

  /**
   * Upload size guide for a category
   */
  uploadSizeGuideByCategory(categoryId: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/sizes/category/${categoryId}/upload`, formData);
  }

  /**
   * Delete size guide for a category
   */
  deleteSizeGuideByCategory(categoryId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sizes/category/${categoryId}/guide`);
  }

  // ========== ADMIN PRODUCT METHODS ==========
  /**
   * Get all categories
   */
  getCategories(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/admin/categories`);
  }

  /**
   * Get parent categories (Nam/Nữ)
   */
  getParentCategories(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/admin/categories/parents`);
  }

  /**
   * Get sub categories by parent ID
   */
  getSubCategories(parentId: number): Observable<any> {
    return this.http.get(`http://localhost:3000/api/admin/categories/children/${parentId}`);
  }

  /**
   * Get all brands
   */
  getBrands(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/admin/brands`);
  }

  /**
   * Get all colors
   */
  getColors(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/admin/colors`);
  }

  /**
   * Get all sizes
   */
  getSizes(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/admin/sizes`);
  }

  /**
   * Get sizes by gender
   */
  getSizesByGender(gender: string): Observable<any> {
    return this.http.get(`http://localhost:3000/api/admin/sizes?gender=${gender}`);
  }

  /**
   * Get sizes by category
   */
  getSizesByCategory(categoryId: number): Observable<any> {
    return this.http.get(`http://localhost:3000/api/admin/sizes/category/${categoryId}/sizes`);
  }

  /**
   * Add new product
   */
  addProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-product`, formData);
  }

  /**
   * Update product
   */
  updateProduct(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${id}`, formData);
  }

  /**
   * Delete product
   */
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  // ========== DASHBOARD METHODS ==========
  /**
   * Get top selling products
   */
  getTopSellingProducts(limit: number = 5): Observable<any> {
    return this.http.get(`http://localhost:3000/api/admin/dashboard/top-selling-products?limit=${limit}`);
  }

  /**
   * Get recent orders
   */
  getRecentOrders(limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/recent-orders?limit=${limit}`);
  }
=======
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
}
