import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  sidebarCollapsed = signal(false);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'fa-solid fa-chart-line' },
    { label: 'Sản phẩm', route: '/admin/products', icon: 'fa-solid fa-box' },
    { label: 'Đơn hàng', route: '/admin/orders', icon: 'fa-solid fa-cart-shopping' },
    { label: 'Người dùng', route: '/admin/users', icon: 'fa-solid fa-user' },
    { label: 'Thương hiệu', route: '/admin/brands', icon: 'fa-solid fa-tag' },
    { label: 'Danh mục', route: '/admin/categories', icon: 'fa-solid fa-list' },
    { label: 'Màu sắc', route: '/admin/colors', icon: 'fa-solid fa-palette' },
    { label: 'Kích thước', route: '/admin/sizes', icon: 'fa-solid fa-ruler' },
    { label: 'Hướng Dẫn Size', route: '/admin/size-guide-settings', icon: 'fa-solid fa-image' },
    { label: 'Đánh giá', route: '/admin/reviews', icon: 'fa-solid fa-star' },
    { label: 'Voucher', route: '/admin/vouchers', icon: 'fa-solid fa-ticket' }
  ];

  toggleSidebar() {
    this.sidebarCollapsed.update(value => !value);
  }

  logout() {
    // Xóa token và thông tin admin ngay lập tức
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    this.notificationService.showSuccess('Đăng xuất thành công');
    
    // Redirect tới trang chủ
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1500);
  }
}