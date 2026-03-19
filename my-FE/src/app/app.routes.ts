import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { AccountComponent } from './pages/account/account.component';
import { AddressesComponent } from './pages/addresses/addresses.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';


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
          { path: 'login',component: LoginComponent },
          { path: 'register',component: RegisterComponent },
          {path: 'forgot-password',component: ForgotPasswordComponent},
          {  path: 'account',  component: AccountComponent},
          {  path: 'addresses',  component: AddressesComponent},
          {path: 'change-password',component: ChangePasswordComponent},
          { path: 'orders',component: OrdersComponent},
          { path: 'cart', component: CartComponent },
          { path: 'checkout', component: CheckoutComponent },
          
      // Add more routes here
      // {
      //   path: 'products',
      //   loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
      //   title: 'Products - GoodShoes'
      // }
    ]

  }
];
