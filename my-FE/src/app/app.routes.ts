import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';

/**
 * Application Routes
 * 
 * Structure:
 * - Main Layout (Header + Footer wrapper)
 *   - Home page (default route)
 *   - Other pages can be added here
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
      // Add more routes here
      // {
      //   path: 'products',
      //   loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
      //   title: 'Products - GoodShoes'
      // }
    ]
  }
];
