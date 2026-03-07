import { Injectable, signal, computed } from '@angular/core';
import { Product, ActiveFilters, SortOption, PaginatedResult, FilterOptions } from '../models/product.model';
import { MOCK_PRODUCTS, MOCK_FILTER_OPTIONS } from '../constants/product-mock.data';

import { FEATURED_PRODUCT } from '../constants/product.constants';
import { IProductOperations } from '../interfaces/service.interface';

/**
 * Service quản lý products
 * Hỗ trợ: filter, sort, pagination
 * Sử dụng mock data (sẽ chuyển sang API khi có Backend)
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService implements IProductOperations {

  /**
   * Lấy featured product
   */
  getFeaturedProduct(): Product {
    return FEATURED_PRODUCT;
  }

  /**
   * Lấy products theo category (mock function for interface)
   */
  getProductsByCategory(category: string): Product[] {
    return [FEATURED_PRODUCT];
  }

  /**
   * Lấy dữ liệu bộ lọc
   */
  getFilterOptions(): FilterOptions {
    return MOCK_FILTER_OPTIONS;
  }

  /**
   * Lấy danh sách sản phẩm có lọc, sắp xếp, phân trang
   */
  getProducts(
    filters: ActiveFilters = { categoryIds: [], brandIds: [], colorIds: [], sizeIds: [] },
    sort: SortOption = 'newest',
    page: number = 1,
    limit: number = 20
  ): PaginatedResult<Product> {
    let result = [...MOCK_PRODUCTS];

    // --- FILTER ---
    // Lọc theo danh mục
    if (filters.categoryIds.length > 0) {
      result = result.filter(p => p.categoryId && filters.categoryIds.includes(p.categoryId));
    }

    // Lọc theo thương hiệu
    if (filters.brandIds.length > 0) {
      result = result.filter(p => p.brandId && filters.brandIds.includes(p.brandId));
    }

    // Lọc theo màu sắc
    if (filters.colorIds.length > 0) {
      result = result.filter(p =>
        p.variants.some(v => v.color && filters.colorIds.includes(v.color.id))
      );
    }

    // Lọc theo kích cỡ
    if (filters.sizeIds.length > 0) {
      result = result.filter(p =>
        p.variants.some(v => v.size && filters.sizeIds.includes(v.size.id))
      );
    }

    // Lọc theo khoảng giá
    if (filters.minPrice !== undefined) {
      result = result.filter(p => (p.minPrice ?? 0) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(p => (p.minPrice ?? 0) <= filters.maxPrice!);
    }

    // Lọc theo tìm kiếm
    if (filters.search && filters.search.trim()) {
      const keyword = filters.search.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.brand?.name.toLowerCase().includes(keyword) ||
        p.category?.name.toLowerCase().includes(keyword)
      );
    }

    // --- SORT ---
    switch (sort) {
      case 'price_asc':
        result.sort((a, b) => (a.minPrice ?? 0) - (b.minPrice ?? 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0));
        break;
      case 'newest':
        result.sort((a, b) => {
          const dateA = a.dateAdd ? new Date(a.dateAdd).getTime() : 0;
          const dateB = b.dateAdd ? new Date(b.dateAdd).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    // --- PAGINATION ---
    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedItems = result.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      totalItems,
      totalPages,
      currentPage: page,
      limit
    };
  }

  /**
   * Lấy sản phẩm theo ID
   */
  getProductById(id: number): Product | undefined {
    // Generate fallback images array if mock product doesn't have one
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    if (product && !product.images) {
      product.images = [product.image, product.image, product.image];
    }
    return product;
  }

  /**
   * Lấy danh sách sản phẩm liên quan (cùng category)
   */
  getRelatedProducts(productId: number, limit: number = 4): Product[] {
    const currentProduct = this.getProductById(productId);
    if (!currentProduct) return [];

    return MOCK_PRODUCTS.filter(p =>
      p.categoryId === currentProduct.categoryId && p.id !== productId
    ).slice(0, limit);
  }

  /**
   * Format giá tiền VND
   */
  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + ' VNĐ';
  }
}
