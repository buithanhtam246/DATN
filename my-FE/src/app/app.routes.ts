import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';

/**
 * Application Routes
 *
 * Structure:
 * - Main Layout (Header + Footer wrapper)
 *   - Home page (default route)
 *   - Products page (danh sách sản phẩm)
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
        path: 'products',
        loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
        title: 'Sản phẩm - GoodShoes'
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
        title: 'Chi tiết sản phẩm - GoodShoes'
      }
    ]
  }
];
