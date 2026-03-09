import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { CartComponent } from './pages/cart/cart.component';
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
      // Add more routes here
      // {
      //   path: 'products',
      //   loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
      //   title: 'Products - GoodShoes'
      // }
    ]
  },
  {
    path: 'admin',
    children: adminRoutes
  }
];
