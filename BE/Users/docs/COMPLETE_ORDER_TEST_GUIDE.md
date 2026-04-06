# 🚀 Hướng Dẫn Test Đầy Đủ Đơn Hàng với Postman

## 📋 Tổng Quan
Hướng dẫn này sẽ giúp bạn test toàn bộ flow đơn hàng từ đăng ký tài khoản đến đánh giá sản phẩm đã giao.

## 🔧 Chuẩn Bị

### 1. Khởi Động Server
```bash
cd d:\FPT\DATN\BE
npm start
```
Server chạy tại: `http://localhost:3000`

### 2. Mở Postman & Tạo Collection
1. Tạo Collection mới: "DATN Order Flow Test"
2. Tạo Environment Variables:
   - `base_url`: `http://localhost:3000`
   - `token`: (sẽ set sau khi login)

---

## 🧪 Dòng Chảy Test Hoàn Chỉnh

### Step 1: 📝 Đăng Ký Tài Khoản
```
POST {{base_url}}/api/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "fullname": "Nguyễn Văn Test",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công"
}
```

### Step 2: 🔐 Đăng Nhập & Lấy Token
```
POST {{base_url}}/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Sau khi nhận response:**
- Copy token từ `data.token`
- Set vào Environment Variable: `token`

### Step 3: 📍 Tạo Địa Chỉ Giao Hàng
```
POST {{base_url}}/api/addresses
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "receiver_name": "Nguyễn Văn Test",
  "receiver_phone": "0123456789",
  "full_address": "123 Đường ABC, Quận 1, TP.HCM",
  "is_default": true
}
```

**Lưu ý:** Lưu `address_id` từ response để dùng cho checkout.

### Step 4: 🛒 Đặt Hàng (Checkout)
```
POST {{base_url}}/api/orders/checkout
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "address_id": 1,
  "payment_method_id": 1,
  "voucher_code": "SAVE10",
  "delivery": "Standard",
  "delivery_cost": 30000,
  "note": "Giao hàng cẩn thận",
  "items": [
    {
      "variant_id": 1,
      "price": 500000,
      "quantity": 2
    },
    {
      "variant_id": 2,
      "price": 300000,
      "quantity": 1
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đặt hàng thành công!",
  "data": {
    "id": 1,
    "status": "pending",
    // ... other fields
  }
}
```

### Step 5: 📋 Xem Lịch Sử Đơn Hàng
```
GET {{base_url}}/api/orders/history
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "pending",
      "canReview": false,
      "items": [
        {
          "id": 1,
          "product_name": "Áo thun",
          "quantity": 2,
          "price": 500000
        }
      ]
    }
  ]
}
```

### Step 6: 🔄 Cập Nhật Trạng Thái Đơn Hàng (Admin)
*Để test review, cần cập nhật status thành "delivered"*

**Cách 1: Sử dụng SQL trực tiếp**
```sql
UPDATE orders SET status = 'delivered' WHERE id = 1;
```

**Cách 2: Sử dụng Admin API** (nếu có)

### Step 7: 📋 Xem Chi Tiết Đơn Hàng (Sau Khi Giao)
```
GET {{base_url}}/api/orders/history/1
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "status": "delivered"
    },
    "items": [
      {
        "id": 1,
        "product_name": "Áo thun",
        "review_id": null
      }
    ],
    "canReview": true
  }
}
```

### Step 8: ⭐ Thêm Đánh Giá Sản Phẩm
```
POST {{base_url}}/api/orders/review
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "orderDetailId": 1,
  "rating": 5,
  "comment": "Sản phẩm rất tốt, chất lượng cao, giao hàng nhanh!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã thêm đánh giá thành công",
  "data": {
    "id": 1,
    "order_detail_id": 1,
    "rating": 5,
    "comment": "Sản phẩm rất tốt, chất lượng cao, giao hàng nhanh!"
  }
}
```

### Step 9: 📖 Xem Reviews của Đơn Hàng
```
GET {{base_url}}/api/orders/reviews/order/1
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_detail_id": 1,
      "rating": 5,
      "comment": "Sản phẩm rất tốt, chất lượng cao, giao hàng nhanh!",
      "created_at": "2026-03-17T10:30:00Z",
      "product_name": "Áo thun"
    }
  ]
}
```

### Step 10: ✏️ Cập Nhật Đánh Giá
```
PUT {{base_url}}/api/orders/review/1
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "rating": 4,
  "comment": "Sản phẩm tốt nhưng giao hơi chậm"
}
```

---

## ⚠️ Lỗi Thường Gặp & Giải Pháp

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|----------|
| `401 Unauthorized` | Token hết hạn | Đăng nhập lại lấy token mới |
| `404 Not Found` | Endpoint sai | Kiểm tra URL đúng |
| `400 Bad Request` | Thiếu trường bắt buộc | Kiểm tra body request |
| `Chỉ có thể đánh giá khi đơn hàng đã được giao` | Status chưa delivered | Cập nhật status đơn hàng |
| `Address not found` | address_id sai | Tạo địa chỉ trước |
| `Variant not found` | variant_id không tồn tại | Kiểm tra variant_id hợp lệ |

---

## 📝 Tips Sử Dụng Postman

### 1. **Environment Variables**
- Set `{{base_url}}` = `http://localhost:3000`
- Set `{{token}}` sau khi login
- Sử dụng cho tất cả requests

### 2. **Tests Scripts**
Thêm vào tab **Tests** của request login:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
}
```

### 3. **Import Collection**
Tạo file JSON với tất cả requests và import vào Postman.

---

## 🎯 Kết Luận

Sau khi hoàn thành các bước trên, bạn đã test thành công:
- ✅ Đăng ký/đăng nhập
- ✅ Tạo địa chỉ giao hàng
- ✅ Đặt hàng với voucher
- ✅ Xem lịch sử đơn hàng
- ✅ Thêm/cập nhật đánh giá khi đơn hàng đã giao

**Chúc bạn test thành công! 🚀**