# Core Module - SOLID Architecture

Thư mục `core` chứa các phần cốt lõi của ứng dụng được tổ chức theo nguyên tắc SOLID.

## Cấu trúc

```
core/
├── models/           # Data models và interfaces
│   ├── menu-item.model.ts
│   ├── product.model.ts
│   └── index.ts
├── services/         # Business logic services
│   ├── navigation.service.ts
│   ├── product.service.ts
│   ├── cart.service.ts
│   └── index.ts
└── constants/        # Static data và configuration
    ├── navigation.constants.ts
    ├── product.constants.ts
    └── index.ts
```

## Nguyên tắc SOLID được áp dụng

### 1. Single Responsibility Principle (SRP)
- Mỗi service chỉ có một trách nhiệm duy nhất
- **NavigationService**: Quản lý navigation menu
- **ProductService**: Quản lý product data
- **CartService**: Quản lý giỏ hàng

### 2. Open/Closed Principle (OCP)
- Services có thể mở rộng mà không cần sửa đổi code hiện tại
- Sử dụng interfaces để định nghĩa contracts

### 3. Liskov Substitution Principle (LSP)
- Components có thể thay thế bằng implementation khác mà không ảnh hưởng
- Sử dụng dependency injection

### 4. Interface Segregation Principle (ISP)
- Tách các interfaces thành các phần nhỏ, cụ thể
- Models được định nghĩa rõ ràng

### 5. Dependency Inversion Principle (DIP)
- Components phụ thuộc vào abstractions (services), không phải concrete implementations
- Sử dụng Angular's Dependency Injection

## Cách sử dụng

### Import models
```typescript
import { Product, MenuItem } from '@app/core/models';
```

### Inject services
```typescript
import { inject } from '@angular/core';
import { ProductService, CartService } from '@app/core/services';

export class MyComponent {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
}
```

### Sử dụng constants
```typescript
import { NAVIGATION_MENU, FEATURED_PRODUCT } from '@app/core/constants';
```
