# 🔗 Hướng Dẫn Kết Nối Angular Frontend - Node.js Backend

## ✅ Những Gì Đã Được Thực Hiện

### Backend (BE)
- ✅ Thêm CORS configuration cho 3 cổng: 4200 (Angular dev), 3000 (Backend), 8080 (React dev)
- ✅ Cài đặt package `cors`
- ✅ Cấu hình headers đầy đủ

### Frontend (Angular - my-FE)
- ✅ Tạo API Service (`api.service.ts`) - quản lý tất cả HTTP requests
- ✅ Tạo Auth Service (`auth.service.ts`) - quản lý login/logout/token
- ✅ Tạo Cart Service (`cart.service.ts`) - quản lý giỏ hàng
- ✅ Tạo Order Service (`order.service.ts`) - quản lý lịch sử đơn hàng
- ✅ Tạo Auth Interceptor - tự động thêm Authorization header
- ✅ Tạo Auth Guard - bảo vệ routes yêu cầu login
- ✅ Cấu hình Environment files (dev & production)

---

## 🚀 Bước Chạy Ứng Dụng

### 1. Khởi Động Backend
```bash
cd d:\FPT\DATN\BE
npm start
# Server chạy ở http://localhost:3000
```

### 2. Khởi Động Frontend
```bash
cd d:\FPT\DATN\my-FE
npm start
# Angular dev server chạy ở http://localhost:4200
```

---

## 📚 Cách Sử Dụng Services Trong Components

### Sử Dụng Auth Service (Login)
```typescript
import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <form (ngSubmit)="onLogin()">
      <input [(ngModel)]="email" name="email" placeholder="Email">
      <input [(ngModel)]="password" name="password" type="password" placeholder="Password">
      <button type="submit">Login</button>
    </form>
  `
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.email, this.password);
  }
}
```

### Sử Dụng Cart Service (Thêm Sản Phẩm Vào Giỏ)
```typescript
import { Component } from '@angular/core';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-product-detail',
  template: `
    <button (click)="addToCart(1, 2)">Thêm Vào Giỏ</button>
  `
})
export class ProductDetailComponent {
  constructor(private cartService: CartService) {}

  addToCart(variantId: number, quantity: number) {
    this.cartService.addToCart(variantId, quantity).subscribe({
      next: (response) => {
        console.log('Đã thêm vào giỏ:', response);
        this.cartService.getCart();
      },
      error: (error) => {
        console.error('Lỗi:', error);
      }
    });
  }
}
```

### Sử Dụng Order Service (Xem Lịch Sử Đơn Hàng)
```typescript
import { Component, OnInit } from '@angular/core';
import { OrderHistoryService } from './services/order.service';

@Component({
  selector: 'app-order-history',
  template: `
    <div *ngFor="let order of orders">
      <p>Mã đơn: {{ order.id }}</p>
      <p>Trạng thái: {{ order.status }}</p>
      <p>Tổng tiền: {{ order.total }}</p>
    </div>
  `
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];

  constructor(private orderService: OrderHistoryService) {}

  ngOnInit() {
    this.orderService.getOrderHistory().subscribe({
      next: (response) => {
        if (response.success) {
          this.orders = response.data;
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải lịch sử:', error);
      }
    });
  }
}
```

### Sử Dụng Cart Service (Lấy Giỏ Hàng)
```typescript
import { Component, OnInit } from '@angular/core';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-cart',
  template: `
    <div *ngFor="let item of cartItems$ | async">
      <p>{{ item.product_name }}</p>
      <p>Giá: {{ item.original_price }}</p>
      <p>Số lượng: {{ item.quantity }}</p>
      <img [src]="item.image" alt="{{ item.product_name }}">
      <button (click)="removeItem(item.id)">Xóa</button>
    </div>
  `
})
export class CartComponent {
  cartItems$ = this.cartService.cartItems$;

  constructor(private cartService: CartService) {}

  removeItem(itemId: number) {
    this.cartService.removeFromCart(itemId).subscribe(() => {
      this.cartService.getCart();
    });
  }
}
```

---

## 🔒 Bảo Vệ Routes Với Auth Guard

Cập nhật `app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'order-history', 
    component: OrderHistoryComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'cart', 
    component: CartComponent, 
    canActivate: [AuthGuard] 
  }
];
```

---

## 🧪 Test Kết Nối

1. **Mở Chrome DevTools** → Network tab
2. **Truy cập Angular** ở `http://localhost:4200`
3. **Kiểm tra requests**:
   - Tất cả requests tới `http://localhost:3000/api/...` nên trả về status 200 hoặc 201
   - Headers nên có `Authorization: Bearer <token>` (nếu đã login)

### Lỗi Thường Gặp

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|----------|
| CORS Error | CORS chưa được cấu hình | Kiểm tra `server.js` có `cors()` không |
| 401 Unauthorized | Token không hợp lệ | Đăng nhập lại, lấy token mới |
| 404 Not Found | API endpoint sai | Kiểm tra URL và HTTP method |
| Cannot connect | Backend chưa chạy | Chạy `npm start` trong BE |

---

## 📦 File Structure

```
my-FE/
├── src/
│   ├── app/
│   │   ├── services/
│   │   │   ├── api.service.ts ✅ (HTTP client)
│   │   │   ├── auth.service.ts ✅ (Authentication)
│   │   │   ├── cart.service.ts ✅ (Cart management)
│   │   │   └── order.service.ts ✅ (Order history)
│   │   ├── core/
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts ✅ (Auto Authorization header)
│   │   │   └── guards/
│   │   │       └── auth.guard.ts ✅ (Route protection)
│   │   └── app.config.ts ✅ (Providers config)
│   └── environments/
│       ├── environment.ts ✅ (Dev config)
│       └── environment.prod.ts ✅ (Prod config)

BE/
├── server.js ✅ (CORS configured)
├── Users/
│   ├── router/
│   │   ├── auth.router.js
│   │   ├── cart.router.js
│   │   ├── order.routes.js
│   │   └── orderHistory.router.js
│   └── controller/
│       └── ...
```

---

## 🎯 Tiếp Theo

1. **Tạo Login Component** - Sử dụng `AuthService.login()`
2. **Tạo Product Component** - Gọi `ApiService.getProducts()`
3. **Tạo Cart Component** - Sử dụng `CartService`
4. **Tạo Order History Component** - Sử dụng `OrderHistoryService`
5. **Thêm Error Handling** - Interceptor để xử lý lỗi chung

---

**✨ Kết nối đã sẵn sàng! Hãy bắt đầu xây dựng giao diện.** 🚀
