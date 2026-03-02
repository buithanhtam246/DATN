import { Injectable } from '@angular/core';
import { Observable, of } from '../../../../node_modules/rxjs/dist/types';
import { Product } from '../models';
import { FEATURED_PRODUCT } from '../constants';
import { IProductOperations } from '../interfaces/service.interface';

/**
 * Service quản lý products
 * Single Responsibility: Chỉ quản lý product data
 * Implements: IProductOperations
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService implements IProductOperations {
  
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
  getProducts(): Observable<Product[]> {
    return of([FEATURED_PRODUCT]);
  }

  /**
   * Lấy product theo ID
   */
  getProductById(id: string): Observable<Product | undefined> {
    // TODO: Implement khi có API
    return of(FEATURED_PRODUCT);
  }

  /**
   * Format giá tiền
   */
  formatPrice(price: string): string {
    return price;
  }
}
