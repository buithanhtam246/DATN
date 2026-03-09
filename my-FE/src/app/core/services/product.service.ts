import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
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
  private readonly http = inject(HttpClient);
  
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

  /**
   * Load products từ JSON file
   */
  loadProductsFromJSON(): Observable<Product[]> {
    return this.http.get<any[]>('/assets/data/sample-products.json').pipe(
      map(data => {
        return data.map(item => ({
          id: item.id?.toString(),
          title: item.name,
          price: item.price,
          imageUrl: item.image,
          brand: this.getBrandName(item.brand_id),
          description: item.describ,
          colors: ['#000000', '#FFFFFF', '#FF0000'], // Mock colors
          sizes: [38, 39, 40, 41, 42, 43]
        }));
      }),
      catchError(error => {
        console.error('Error loading products from JSON:', error);
        // Return fallback data
        return of(this.getFallbackProducts());
      })
    );
  }

  /**
   * Lấy danh sách sản phẩm gợi ý (random)
   */
  getRecommendedProducts(limit: number = 4): Observable<Product[]> {
    return this.loadProductsFromJSON().pipe(
      map(products => {
        // Shuffle và lấy số lượng sản phẩm theo limit
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
      })
    );
  }

  /**
   * Helper: Lấy tên brand từ ID
   */
  private getBrandName(brandId: number): string {
    const brands: { [key: number]: string } = {
      1: 'NIKE',
      2: 'ADIDAS',
      3: 'PUMA',
      4: 'REEBOK'
    };
    return brands[brandId] || 'UNKNOWN';
  }

  /**
   * Fallback products khi không load được từ JSON
   */
  private getFallbackProducts(): Product[] {
    return [
      {
        id: '1',
        title: 'Nike Air Force 1 \'07',
        price: '2.695.000 VND',
        imageUrl: '/assets/images/products/nikeaf1.jpg',
        brand: 'NIKE',
        colors: ['#000000', '#FFFFFF'],
        sizes: [38, 39, 40, 41, 42, 43]
      },
      {
        id: '2',
        title: 'Nike Air Jordan 1 Retro High',
        price: '4.290.000 VND',
        imageUrl: '/assets/images/products/nikejd.jpg',
        brand: 'NIKE',
        colors: ['#000000', '#FF0000'],
        sizes: [38, 39, 40, 41, 42, 43]
      },
      {
        id: '3',
        title: 'Adidas Superstar Classic',
        price: '2.390.000 VND',
        imageUrl: '/assets/images/products/superstar.jpg',
        brand: 'ADIDAS',
        colors: ['#000000', '#FFFFFF'],
        sizes: [38, 39, 40, 41, 42, 43]
      },
      {
        id: '4',
        title: 'Nike Air Max 270',
        price: '3.890.000 VND',
        imageUrl: '/assets/images/products/nikeamax.jpg',
        brand: 'NIKE',
        colors: ['#0000FF', '#FFFFFF'],
        sizes: [38, 39, 40, 41, 42, 43]
      }
    ];
  }
}
