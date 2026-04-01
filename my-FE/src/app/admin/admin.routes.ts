import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminLoginComponent } from './page/login/admin-login.component';
import { AdminGuard } from '../core/guards/admin.guard';

/**
 * Admin Routes
 * All admin routes are under /admin path
 */
export const adminRoutes: Routes = [
  {
    path: 'login',
    component: AdminLoginComponent,
    title: 'Admin Login - GoodShoes'
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./page/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - Admin'
      },
      {
        path: 'products',
        loadComponent: () => import('./page/products/products.component').then(m => m.ProductsComponent),
        title: 'Quản lý sản phẩm - Admin'
      },
      {
        path: 'orders',
        loadComponent: () => import('./page/orders/orders.component').then(m => m.OrdersComponent),
        title: 'Quản lý đơn hàng - Admin'
      },
      {
        path: 'users',
        loadComponent: () => import('./page/users/users.component').then(m => m.UsersComponent),
        title: 'Quản lý người dùng - Admin'
      },
      {
        path: 'brands',
        loadComponent: () => import('./page/brands/brands.component').then(m => m.BrandsComponent),
        title: 'Quản lý thương hiệu - Admin'
      },
      {
        path: 'categories',
        loadComponent: () => import('./page/categories/categories.component').then(m => m.CategoriesComponent),
        title: 'Quản lý danh mục - Admin'
      },
      {
        path: 'reviews',
        loadComponent: () => import('./page/reviews/reviews.component').then(m => m.ReviewsComponent),
        title: 'Quản lý đánh giá - Admin'
      },
      {
        path: 'vouchers',
        loadComponent: () => import('./page/vouchers/vouchers.component').then(m => m.VouchersComponent),
        title: 'Quản lý voucher - Admin'
      },
      {
        path: 'colors',
        loadComponent: () => import('./page/colors/colors.component').then(m => m.ColorsComponent),
        title: 'Quản lý màu sắc - Admin'
      },
      {
        path: 'sizes',
        loadComponent: () => import('./page/sizes/sizes-simple.component').then(m => m.SizesSimpleComponent),
        title: 'Quản lý kích thước - Admin'
      },
      {
        path: 'size-guide-settings',
        loadComponent: () => import('./page/size-guide-settings/size-guide-settings.component').then(m => m.SizeGuideSettingsComponent),
        title: 'Cài đặt hướng dẫn size - Admin'
      },
      {
        path: 'size-guides',
        loadComponent: () => import('./page/size-guides/size-guides.component').then(m => m.SizeGuidesComponent),
        title: 'Quản lý hướng dẫn size - Admin'
      }
    ]
  }
];