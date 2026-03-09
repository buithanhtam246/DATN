import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

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
  
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'fa-solid fa-chart-line' },
    { label: 'Sản phẩm', route: '/admin/products', icon: 'fa-solid fa-box' },
    { label: 'Đơn hàng', route: '/admin/orders', icon: 'fa-solid fa-cart-shopping' },
    { label: 'Người dùng', route: '/admin/users', icon: 'fa-solid fa-user' },
    { label: 'Thương hiệu', route: '/admin/brands', icon: 'fa-solid fa-tag' },
    { label: 'Đánh giá', route: '/admin/reviews', icon: 'fa-solid fa-star' },
    { label: 'Voucher', route: '/admin/vouchers', icon: 'fa-solid fa-ticket' }
  ];

  toggleSidebar() {
    this.sidebarCollapsed.update(value => !value);
  }

  logout() {
    // Implement logout logic
    console.log('Logout');
  }
}
