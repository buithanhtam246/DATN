import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MenuItem } from '../models';
import { NAVIGATION_MENU } from '../constants';

/**
 * Service quản lý navigation menu
 * Single Responsibility: Chỉ quản lý navigation
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private http = inject(HttpClient);
  private menuItemsSignal = signal<MenuItem[]>(NAVIGATION_MENU);

  constructor() {
    this.loadCategories();
  }

  /**
   * Load danh mục cha từ API
   */
  private loadCategories(): void {
    this.http.get<any>('http://localhost:3000/api/admin/categories').subscribe({
      next: (response: any) => {
        const categories = response.data || response || [];
        console.log('📋 All categories from API:', categories);
        
        // Filter only parent categories (isParent = true)
        const parentCategories = categories.filter((cat: any) => cat.isParent && cat.status === 'active');
        console.log('✅ Parent categories:', parentCategories);
        
        // Map categories to MenuItem format
        const categoryMenuItems = parentCategories.map((cat: any) => ({
          label: cat.name,
          link: `/category/${cat.id}`
        }));
        
        // Combine default menu (without categories and sales)
        const newMenu = [
          { label: 'Mới & Nổi bật', link: '/new' },
          { label: 'Sản phẩm', link: '/products' },
          { label: 'Tin tức', link: '/news' }
        ];
        
        this.menuItemsSignal.set(newMenu);
        console.log('✅ Navigation menu updated:', newMenu);
      },
      error: (err) => {
        console.error('❌ Error loading categories:', err);
        // Keep default menu
        this.menuItemsSignal.set(NAVIGATION_MENU);
      }
    });
  }

  /**
   * Lấy danh sách menu items signal
   */
  getMenuItems(): MenuItem[] {
    return this.menuItemsSignal();
  }

  /**
   * Get menu items signal for reactive updates
   */
  getMenuItemsSignal() {
    return this.menuItemsSignal;
  }

  /**
   * Tìm menu item theo label
   */
  findMenuItemByLabel(label: string): MenuItem | undefined {
    return this.menuItemsSignal().find(item => item.label === label);
  }

  /**
   * Kiểm tra menu item có active không
   */
  isMenuItemActive(link: string, currentUrl: string): boolean {
    return currentUrl.startsWith(link);
  }
}
