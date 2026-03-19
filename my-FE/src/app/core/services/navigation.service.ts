import { Injectable } from '@angular/core';
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
  private menuItems: MenuItem[] = NAVIGATION_MENU;

  /**
   * Lấy danh sách menu items
   */
  getMenuItems(): MenuItem[] {
    return [...this.menuItems]; // Return copy để tránh mutation
  }

  /**
   * Tìm menu item theo label
   */
  findMenuItemByLabel(label: string): MenuItem | undefined {
    return this.menuItems.find(item => item.label === label);
  }

  /**
   * Kiểm tra menu item có active không
   */
  isMenuItemActive(link: string, currentUrl: string): boolean {
    return currentUrl.startsWith(link);
  }
}
