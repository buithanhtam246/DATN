# 📋 Hướng Dẫn Test API Lịch Sử Đơn Hàng với Postman

## 🔑 Chuẩn Bị
1. **Token JWT**: Đăng nhập trước để lấy token
   - POST `/api/auth/login`
   - Lưu token vào biến `{{token}}` trong Postman

## 📝 Các API Endpoint

### 1️⃣ **Lấy Lịch Sử Đơn Hàng**
```
GET /api/orders/history
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "total_price": 500000,
      "status": "delivered",
      "create_at": "2026-03-06T10:30:00Z",
      "canReview": true,
      "items": [
        {
          "id": 1,
          "order_id": 1,
          "quantity": 2,
          "price": 150000,
          "variant_id": 1,
          "product_name": "Áo thun",
          "image": "path/to/image.jpg"
        }
      ]
    }
  ]
}
```

---

### 2️⃣ **Chi Tiết Một Đơn Hàng**
```
GET /api/orders/history/{{orderId}}
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Path Variables:**
- `orderId`: ID của đơn hàng (vd: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "user_id": 1,
      "total_price": 500000,
      "status": "delivered",
      "create_at": "2026-03-06T10:30:00Z"
    },
    "items": [
      {
        "id": 1,
        "quantity": 2,
        "price": 150000,
        "variant_id": 1,
        "name": "Áo thun size M",
        "product_name": "Áo thun",
        "review_id": 5,
        "rating": 5,
        "comment": "Sản phẩm rất tốt!",
        "review_date": "2026-03-07T14:00:00Z"
      }
    ],
    "canReview": true
  }
}
```

---

### 3️⃣ **Lấy Timeline Trạng Thái Đơn Hàng**
```
GET /api/orders/history/{{orderId}}/timeline
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": 1,
    "current_status": "delivered",
    "timeline": {
      "pending": {
        "stage": 1,
        "label": "Chờ xác nhận",
        "completed": true
      },
      "confirmed": {
        "stage": 2,
        "label": "Đã xác nhận",
        "completed": true
      },
      "shipped": {
        "stage": 3,
        "label": "Đang giao",
        "completed": true
      },
      "delivered": {
        "stage": 4,
        "label": "Đã giao",
        "completed": true
      }
    },
    "created_at": "2026-03-06T10:30:00Z"
  }
}
```

---

### 4️⃣ **Thêm Review cho Đơn Hàng**
```
POST /api/orders/review
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "orderDetailId": 1,
  "rating": 5,
  "comment": "Sản phẩm rất tốt, chất lượng cao!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "id": 1,
    "order_detail_id": 1,
    "rating": 5,
    "comment": "Sản phẩm rất tốt, chất lượng cao!"
  }
}
```

---

### 5️⃣ **Cập Nhật Review**
```
PUT /api/orders/review/{{reviewId}}
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Path Variables:**
- `reviewId`: ID của review (vd: 1)

**Body (JSON):**
```json
{
  "rating": 4,
  "comment": "Chất lượng tốt nhưng giao hơi lâu"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review updated successfully"
}
```

---

### 6️⃣ **Lấy Reviews của Đơn Hàng**
```
GET /api/orders/reviews/order/{{orderId}}
```

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Path Variables:**
- `orderId`: ID của đơn hàng (vd: 1)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_detail_id": 1,
      "rating": 5,
      "comment": "Sản phẩm rất tốt, chất lượng cao!",
      "created_at": "2026-03-07T14:00:00Z",
      "quantity": 2,
      "price": 150000,
      "product_name": "Áo thun",
      "image": "path/to/image.jpg"
    }
  ]
}
```

---

## 🧪 Test Steps trong Postman

### Step 1: Đăng Nhập
1. POST `/api/auth/login`
2. Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
3. Lưu token: `Ctrl + Shift + P` → Set Global Variable → `token={{response.body.data.token}}`

### Step 2: Test Lịch Sử
```bash
GET http://localhost:3000/api/orders/history
Header: Authorization: Bearer {{token}}
```

### Step 3: Test Chi Tiết Đơn Hàng
```bash
GET http://localhost:3000/api/orders/history/1
Header: Authorization: Bearer {{token}}
```

### Step 4: Test Timeline
```bash
GET http://localhost:3000/api/orders/history/1/timeline
Header: Authorization: Bearer {{token}}
```

### Step 5: Test Thêm Review
```bash
POST http://localhost:3000/api/orders/review
Header: Authorization: Bearer {{token}}
Body:
{
  "orderDetailId": 1,
  "rating": 5,
  "comment": "Rất hài lòng!"
}
```

### Step 6: Test Lấy Reviews của Đơn Hàng
```bash
GET http://localhost:3000/api/orders/reviews/order/1
Header: Authorization: Bearer {{token}}
```

---

## ⚠️ Lỗi Có Thể Gặp

| Code | Lỗi | Giải Pháp |
|------|-----|---------|
| 401 | Unauthorized | Kiểm tra token JWT |
| 404 | Order not found | Kiểm tra Order ID có tồn tại |
| 400 | Missing fields | Kiểm tra body request |
| 500 | Server error | Kiểm tra database connection |

---

## 📌 Notes
- Tất cả endpoint yêu cầu Bearer token JWT
- Rating phải từ 1 đến 5
- Comment là optional
- Ngày giờ sử dụng format ISO 8601
- `canReview: true` chỉ xuất hiện khi đơn hàng có status "delivered"
- Chỉ có thể thêm/cập nhật review khi đơn hàng đã giao (status = "delivered")
