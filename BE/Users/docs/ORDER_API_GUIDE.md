# 📋 Hướng Dẫn API Đơn Hàng

## Tổng Quan

Hệ thống đơn hàng cho phép người dùng:
- 🛒 Đặt hàng với nhiều sản phẩm
- 📦 Theo dõi trạng thái đơn hàng
- 📋 Xem chi tiết đơn hàng đầy đủ
- 💰 Áp dụng voucher giảm giá
- 🚚 Chọn phương thức giao hàng

---

## API Endpoints

### 1️⃣ Đặt Hàng (Checkout)

**Endpoint**: `POST /api/orders/checkout`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body**:
```json
{
  "address_id": 1,
  "payment_method_id": 1,
  "voucher_code": "DISCOUNT10",
  "items": [
    {
      "variant_id": 1,
      "quantity": 2,
      "price": 50000
    },
    {
      "variant_id": 2,
      "quantity": 1,
      "price": 75000
    }
  ],
  "delivery_cost": 30000,
  "note": "Giao hàng vào buổi sáng",
  "delivery": "Giao hàng tiêu chuẩn"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Đặt hàng thành công!",
  "data": {
    "id": 1,
    "user_id": 1,
    "address_id": 1,
    "total_price": 203000,
    "delivery_cost": 30000,
    "status": "pending",
    "voucher_id": 1,
    "subtotal": 170000,
    "discount_amount": 17000,
    "create_at": "2026-03-05T10:30:00.000Z"
  }
}
```

### 2️⃣ Xem Chi Tiết Đơn Hàng

**Endpoint**: `GET /api/orders/:id`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN
```

**URL Parameters**:
- `id`: ID của đơn hàng (số nguyên)

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy chi tiết đơn hàng thành công",
  "data": {
    "id": 1,
    "user_id": 1,
    "address_id": 1,
    "total_price": "203000.00",
    "delivery_cost": "30000.00",
    "status": "pending",
    "voucher_id": 1,
    "note": "Giao hàng vào buổi sáng",
    "delivery": "Giao hàng tiêu chuẩn",
    "create_at": "2026-03-05T10:30:00.000Z",
    "details": [
      {
        "id": 1,
        "order_id": 1,
        "variant_id": 1,
        "quantity": 2,
        "price": "50000.00",
        "variant": {
          "id": 1,
          "product_id": 1,
          "size": "M",
          "color": "Đỏ"
        }
      }
    ],
    "address": {
      "id": 1,
      "user_id": 1,
      "full_name": "Nguyễn Văn A",
      "phone": "0123456789",
      "address": "123 Đường ABC, Quận 1, TP.HCM"
    },
    "paymentMethod": {
      "id": 1,
      "name": "Thanh toán khi nhận hàng",
      "description": "COD"
    },
    "voucher": {
      "id": 1,
      "code": "DISCOUNT10",
      "discount_percent": 10
    }
  }
}
```


### 3️⃣ 🔄 Cập Nhật Trạng Thái Đơn Hàng

**Endpoint**: `PATCH /api/orders/:id/status`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**URL Parameters**:
- `id`: ID của đơn hàng

**Body**:
```json
{
  "status": "confirmed"
}
```

**Allowed statuses**: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Cập nhật trạng thái thành công",
  "data": { ... }
}
```

**Notes**:
- Chỉ chủ đơn hoặc admin mới có quyền thay đổi
- Trạng thái phải là giá trị hợp lệ

---

## 🔐 Bảo Mật & Quyền Truy Cập

### Authentication
- Tất cả endpoints đều yêu cầu JWT token
- Header: `Authorization: Bearer <token>`

### Authorization
- Chỉ người tạo đơn hàng mới có quyền xem chi tiết
- Kiểm tra `user_id` của đơn hàng với `user.id` từ token
 - Cập nhật trạng thái: chủ đơn hàng hoặc `role === 'admin'`


---

## 📋 Validation Rules

### Checkout
- `address_id`: Bắt buộc, phải tồn tại
- `payment_method_id`: Bắt buộc, phải tồn tại
- `items`: Mảng ít nhất 1 item
- `items[].variant_id`: Bắt buộc, phải tồn tại
- `items[].quantity`: > 0
- `items[].price`: > 0
- `delivery_cost`: >= 0 (mặc định 30000)
- `voucher_code`: Tùy chọn, nếu có thì phải hợp lệ

### Get Order Details
- `id`: Phải là số nguyên hợp lệ
- Đơn hàng phải tồn tại
- User phải là chủ sở hữu

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "ID đơn hàng không hợp lệ"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Đơn hàng không tồn tại"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Bạn không có quyền xem đơn hàng này"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Lỗi server"
}
```

---

## 🧪 Test Cases

### ✅ Thành công
1. Đặt hàng với đầy đủ thông tin
2. Xem chi tiết đơn hàng của mình
3. Áp dụng voucher hợp lệ
4. Đặt hàng không có voucher

### ❌ Thất bại
1. Xem đơn hàng không tồn tại
2. Xem đơn hàng của user khác
3. Đặt hàng với variant không tồn tại
4. Đặt hàng không có authentication
5. Cập nhật trạng thái không hợp lệ
6. Cập nhật trạng thái đơn hàng của user khác

---

## 📊 Database Schema

### orders
- `id`: Primary Key
- `user_id`: Foreign Key → users
- `address_id`: Foreign Key → addresses
- `total_price`: DECIMAL(12,2)
- `delivery_cost`: DECIMAL(12,2)
- `status`: ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
- `payment_method_id`: Foreign Key → payment_methods
- `voucher_id`: Foreign Key → vouchers (nullable)
- `note`: TEXT (nullable)
- `delivery`: VARCHAR(100) (nullable)
- `create_at`: DATETIME

### order_details
- `id`: Primary Key
- `order_id`: Foreign Key → orders
- `variant_id`: Foreign Key → product_variants
- `quantity`: INT
- `price`: DECIMAL(12,2)

---

## 🎯 Use Cases

### E-commerce Flow
1. User thêm sản phẩm vào giỏ hàng
2. User chọn địa chỉ giao hàng
3. User chọn phương thức thanh toán
4. User nhập mã voucher (tùy chọn)
5. System tính tổng tiền và áp dụng giảm giá
6. User xác nhận đặt hàng
7. System tạo order và order_details
8. User có thể xem chi tiết đơn hàng bất cứ lúc nào

### Order Tracking
- User xem lịch sử đơn hàng
- User xem chi tiết từng đơn hàng
- System hiển thị trạng thái hiện tại
- User có thể đánh giá sản phẩm sau khi nhận hàng