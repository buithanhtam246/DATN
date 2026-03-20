import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { Products } from './pages/products/products';
import { AccountComponent } from './pages/account/account.component';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { RegisterComponent } from './pages/register/register.component';
import { adminRoutes } from './admin/admin.routes';

/**
 * Application Routes
 * 
 * Structure:
 * - Main Layout (Header + Footer wrapper)
 *   - Home page (default route)
 *   - Cart page
 *   - Other pages can be added here
 * - Admin routes (separate layout)
 */
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        title: 'Home - GoodShoes'
      },
      {
        path: 'cart',
        component: CartComponent,
        title: 'Giỏ hàng - GoodShoes'
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        title: 'Thanh toán - GoodShoes'
      },
      {
        path: 'products',
        component: Products,
        title: 'Sản phẩm - GoodShoes'
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./products-detail/product-detail.component').then(m => m.ProductDetailComponent),
        title: 'Chi tiết sản phẩm - GoodShoes'
      },
      {
        path: 'account',
        component: AccountComponent,
        title: 'Tài khoản - GoodShoes'
      },
      {
        path: 'login',
        component: LoginComponent,
        title: 'Đăng nhập - GoodShoes'
      },
      {
        path: 'register',
        component: RegisterComponent,
        title: 'Đăng ký - GoodShoes'
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        title: 'Quên mật khẩu - GoodShoes'
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
        title: 'Đổi mật khẩu - GoodShoes'
      }
      // Add more routes here
    ]
  },
  {
    path: 'admin',
    children: adminRoutes
  }
];
