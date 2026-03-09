import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

/**
 * Admin Routes
 * All admin routes are under /admin path
 */
export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - Admin'
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products.component').then(m => m.AdminProductsComponent),
        title: 'Quản lý sản phẩm - Admin'
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders.component').then(m => m.OrdersComponent),
        title: 'Quản lý đơn hàng - Admin'
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
        title: 'Quản lý người dùng - Admin'
      },
      {
        path: 'brands',
        loadComponent: () => import('./pages/brands/brands.component').then(m => m.AdminBrandsComponent),
        title: 'Quản lý thương hiệu - Admin'
      },
      {
        path: 'reviews',
        loadComponent: () => import('./pages/reviews/reviews.component').then(m => m.ReviewsComponent),
        title: 'Quản lý đánh giá - Admin'
      },
      {
        path: 'vouchers',
        loadComponent: () => import('./pages/vouchers/vouchers.component').then(m => m.VouchersComponent),
        title: 'Quản lý voucher - Admin'
      }
    ]
  }
];
