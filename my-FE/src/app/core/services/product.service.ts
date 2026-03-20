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
   */
  getProducts(): Observable<Product[]> {
    return this.loadProductsFromJSON();
  }

  /**
   * Lấy product theo ID
   */
  getProductById(id: string): Observable<Product | undefined> {
    return this.loadProductsFromJSON().pipe(
      map(products => products.find(p => p.id === id))
    );
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
        console.log('Successfully loaded products from JSON:', data.length);
        return data.map(item => ({
          id: item.id?.toString(),
          title: item.name,
          price: item.price,
          imageUrl: item.image,
          images: item.gallery || [item.image], // Thêm gallery ảnh
          brand: this.getBrandName(item.brand_id),
          category: item.category || 'Giày',
          description: item.describ,
          colors: item.variants ? this.getUniqueColors(item.variants) : ['#000000', '#FFFFFF'],
          sizes: item.variants ? this.getUniqueSizes(item.variants) : [38, 39, 40, 41, 42, 43],
          variants: item.variants || [],
          minPrice: item.variants ? this.getMinPrice(item.variants) : this.parsePrice(item.price),
          minPriceSale: item.variants ? this.getMinPriceSale(item.variants) : undefined
        }));
      }),
      catchError(error => {
        console.error('Error loading products from JSON, using fallback data:', error);
        // Return fallback data
        return of(this.getFallbackProducts());
      })
    );
  }

  /**
   * Helper: Lấy màu sắc unique từ variants
   */
  private getUniqueColors(variants: any[]): string[] {
    const colors = variants.map(v => v.color?.tableColor).filter(c => c);
    return [...new Set(colors)];
  }

  /**
   * Helper: Lấy sizes unique từ variants
   */
  private getUniqueSizes(variants: any[]): number[] {
    const sizes = variants.map(v => parseInt(v.size?.bangSize)).filter(s => !isNaN(s));
    return [...new Set(sizes)].sort((a, b) => a - b);
  }

  /**
   * Helper: Lấy giá thấp nhất từ variants
   */
  private getMinPrice(variants: any[]): number {
    const prices = variants.map(v => v.price).filter(p => p);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }

  /**
   * Helper: Lấy giá sale thấp nhất từ variants
   */
  private getMinPriceSale(variants: any[]): number | undefined {
    const salePrices = variants.map(v => v.priceSale).filter(p => p);
    return salePrices.length > 0 ? Math.min(...salePrices) : undefined;
  }

  /**
   * Helper: Parse price string to number
   */
  private parsePrice(priceStr: string): number {
    if (typeof priceStr === 'number') return priceStr;
    // Remove all dots and commas, keep only numbers
    return parseFloat(priceStr.replace(/\./g, '').replace(/,/g, '').replace(/[^0-9]/g, '')) || 0;
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
      },
      {
        id: '5',
        title: 'Nike Vomero 18',
        price: '3.290.000 VND',
        imageUrl: '/assets/images/products/vomero.jpg',
        brand: 'NIKE',
        colors: ['#FF0000', '#FFFFFF'],
        sizes: [38, 39, 40, 41, 42, 43]
      },
      {
        id: '6',
        title: 'Nike Dunk Low Retro',
        price: '2.990.000 VND',
        imageUrl: '/assets/images/products/nikeduck.jpg',
        brand: 'NIKE',
        colors: ['#000000', '#FFFFFF'],
        sizes: [38, 39, 40, 41, 42, 43]
      },
      {
        id: '7',
        title: 'Nike Vapormax 2024',
        price: '4.590.000 VND',
        imageUrl: '/assets/images/products/vapomax.jpg',
        brand: 'NIKE',
        colors: ['#0000FF', '#000000'],
        sizes: [38, 39, 40, 41, 42, 43]
      },
      {
        id: '8',
        title: 'Adidas Ultraboost 5',
        price: '4.590.000 VND',
        imageUrl: '/assets/images/products/ultraboost.jpg',
        brand: 'ADIDAS',
        colors: ['#000000', '#FFFFFF'],
        sizes: [38, 39, 40, 41, 42, 43]
      }
    ];
  }
}
