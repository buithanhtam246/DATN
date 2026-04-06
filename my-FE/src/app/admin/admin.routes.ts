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
        path: 'banners',
        loadComponent: () => import('./page/banners/banners.component').then(m => m.BannersComponent),
        title: 'Quản lý banner - Admin'
      },
      {
        path: 'banners/categories',
        loadComponent: () => import('./page/banner-categories/banner-categories.component').then(m => m.BannerCategoriesComponent),
        title: 'Banner danh mục - Admin'
      },
      {
        path: 'banners/sports',
        loadComponent: () => import('./page/banner-sports/banner-sports.component').then(m => m.BannerSportsComponent),
        title: 'Banner thể thao - Admin'
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
        loadComponent: () => import('./page/sizes/sizes.component').then(m => m.SizesComponent),
        title: 'Quản lý kích thước - Admin'
      }
    ]
  }
];