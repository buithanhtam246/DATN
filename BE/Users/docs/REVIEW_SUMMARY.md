# ✅ Tóm Tắt - Phần Đánh Giá Đơn Hàng Đã Hoàn Thành

## 📁 File Tạo Mới

### 1. **Repository** (`Users/repository/review.repository.js`)
- `createReview(data)` - Tạo đánh giá mới
- `findById(reviewId)` - Lấy đánh giá theo ID
- `findByOrderDetailId(orderDetailId)` - Lấy đánh giá của order detail
- `findByVariantId(variantId, limit, offset)` - Lấy đánh giá sản phẩm (có phân trang)
- `findByOrderId(orderId)` - Lấy tất cả đánh giá của một đơn hàng
- `updateReview(reviewId, data)` - Cập nhật đánh giá
- `deleteReview(reviewId)` - Xóa đánh giá (soft delete)
- `getReviewStats(variantId)` - Thống kê đánh giá (trung bình, phân bố sao, etc)

### 2. **Service** (`Users/service/review.service.js`)
- `createReview(userId, orderDetailId, reviewData)` - Tạo đánh giá với validation
- `getProductReviews(variantId, page, limit)` - Lấy đánh giá sản phẩm có phân trang
- `getOrderReviews(userId, orderId)` - Lấy đánh giá của đơn hàng
- `updateReview(userId, reviewId, reviewData)` - Cập nhật đánh giá
- `deleteReview(userId, reviewId)` - Xóa đánh giá

**Validation Thực Hiện:**
- ✅ Kiểm tra order detail tồn tại
- ✅ Kiểm tra quyền chủ sở hữu
- ✅ Kiểm tra đơn hàng đã giao
- ✅ Kiểm tra không đánh giá trùng
- ✅ Validate rating (1-5)
- ✅ Validate comment (1-1000 ký tự)

### 3. **Controller** (`Users/controller/review.controller.js`)
- `create()` - Endpoint tạo đánh giá
- `getProductReviews()` - Endpoint lấy đánh giá sản phẩm
- `getOrderReviews()` - Endpoint lấy đánh giá đơn hàng
- `update()` - Endpoint cập nhật đánh giá
- `delete()` - Endpoint xóa đánh giá

### 4. **Router** (`Users/router/review.router.js`)
```javascript
POST   /api/reviews/create              - Tạo đánh giá (yêu cầu auth)
GET    /api/reviews/product             - Lấy đánh giá sản phẩm (công khai)
GET    /api/reviews/order/:order_id     - Lấy đánh giá đơn hàng (yêu cầu auth)
PUT    /api/reviews/update/:review_id   - Cập nhật đánh giá (yêu cầu auth)
DELETE /api/reviews/delete/:review_id   - Xóa đánh giá (yêu cầu auth)
```

---

## 🔧 File Được Cập Nhật

### 1. **server.js**
- ✅ Import `reviewRouter`
- ✅ Thêm route `/api/reviews`
- ✅ Đã setup associations cho Order ↔ OrderDetail ↔ OrderReview

---

## 📊 Database

### Bảng `order_reviews` (Đã kiểm tra & sẵn sàng)
```sql
CREATE TABLE order_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_detail_id INT NULL,
  rating INT NULL,                      -- 1-5 sao
  comment TEXT NULL,                    -- Nhận xét
  created_at DATETIME DEFAULT NOW(),
  status TINYINT DEFAULT 1,             -- 1: hiển thị, 0: ẩn
  FOREIGN KEY (order_detail_id) REFERENCES order_details(id)
);
```

---

## 🚀 API Endpoints

### 1️⃣ Tạo Đánh Giá
```
POST /api/reviews/create
Authorization: Bearer TOKEN
Content-Type: application/json

Body:
{
  "order_detail_id": 1,
  "rating": 5,
  "comment": "Sản phẩm rất tốt!"
}

Response (201):
{
  "success": true,
  "message": "Đánh giá thành công!",
  "data": { ... }
}
```

### 2️⃣ Lấy Đánh Giá Sản Phẩm
```
GET /api/reviews/product?variant_id=1&page=1&limit=10

Response (200):
{
  "success": true,
  "data": {
    "reviews": [ ... ],
    "pagination": { ... },
    "stats": {
      "total_reviews": 25,
      "avg_rating": "4.7",
      "rating_distribution": { ... }
    }
  }
}
```

### 3️⃣ Lấy Đánh Giá Đơn Hàng
```
GET /api/reviews/order/:order_id
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "data": [ ... ]
}
```

### 4️⃣ Cập Nhật Đánh Giá
```
PUT /api/reviews/update/:review_id
Authorization: Bearer TOKEN
Content-Type: application/json

Body:
{
  "rating": 4,
  "comment": "Cập nhật nhận xét"
}

Response (200):
{
  "success": true,
  "message": "Cập nhật đánh giá thành công!",
  "data": { ... }
}
```

### 5️⃣ Xóa Đánh Giá
```
DELETE /api/reviews/delete/:review_id
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "message": "Xóa đánh giá thành công!"
}
```

---

## 📋 Tính Năng Chính

✅ **Tạo đánh giá** - User có thể đánh giá sản phẩm từ đơn hàng đã giao
✅ **Xem đánh giá** - Mọi người có thể xem đánh giá sản phẩm (công khai)
✅ **Thống kê** - Hiển thị trung bình sao, phân bố rating, tổng số đánh giá
✅ **Chỉnh sửa** - User có thể cập nhật đánh giá của mình
✅ **Xóa** - User có thể xóa đánh giá (soft delete)
✅ **Phân trang** - Đánh giá được chia thành trang
✅ **Bảo mật** - Kiểm tra quyền chủ sở hữu

---

## 🔐 Bảo Mật & Validation

| Yêu Cầu | Chi Tiết |
|---------|----------|
| **Authentication** | Yêu cầu token để tạo/cập nhật/xóa |
| **Authorization** | Chỉ chủ nhân được phép cập nhật/xóa |
| **Order Status** | Chỉ có thể đánh giá đơn hàng "delivered" |
| **Unique Review** | Mỗi sản phẩm chỉ đánh giá 1 lần |
| **Rating Range** | 1-5 sao bắt buộc |
| **Comment Length** | 1-1000 ký tự bắt buộc |

---

## 📚 Tài Liệu

- **REVIEW_API_GUIDE.md** - Hướng dẫn chi tiết sử dụng API
- **POSTMAN_TEST_GUIDE.md** - Hướng dẫn test với Postman

---

## 🧪 Cách Test

### 1. Khởi động Server
```bash
cd d:\FPT\DATN\BE
npm start
```

### 2. Test API trong Postman

**a) Đăng Nhập**
```
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password" }
```
Copy token từ response

**b) Tạo Đánh Giá**
```
POST /api/reviews/create
Headers: Authorization: Bearer [TOKEN]
Body: { "order_detail_id": 1, "rating": 5, "comment": "Tuyệt vời!" }
```

**c) Xem Đánh Giá**
```
GET /api/reviews/product?variant_id=1&page=1&limit=10
```

**d) Xem Đánh Giá Đơn Hàng**
```
GET /api/reviews/order/1
Headers: Authorization: Bearer [TOKEN]
```

**e) Cập Nhật**
```
PUT /api/reviews/update/1
Headers: Authorization: Bearer [TOKEN]
Body: { "rating": 4, "comment": "Có ổn thôi" }
```

**f) Xóa**
```
DELETE /api/reviews/delete/1
Headers: Authorization: Bearer [TOKEN]
```

---

## 📞 Support

Nếu có lỗi:

1. **"Chi tiết đơn hàng không tồn tại"** - Kiểm tra order_detail_id đúng
2. **"Bạn đã đánh giá sản phẩm này rồi"** - Mỗi sản phẩm chỉ đánh giá 1 lần
3. **"Chỉ có thể đánh giá sản phẩm từ đơn hàng đã giao"** - Đặt status đơn hàng = "delivered"
4. **Token hết hạn** - Lấy token mới từ login

---

✅ **Phần Đánh Giá Đơn Hàng - HOÀN THÀNH!**

Bạn giờ có thể:
- 🎯 Cho phép user đánh giá sản phẩm
- 📊 Hiển thị thống kê đánh giá trên trang sản phẩm
- ⭐ Xem trung bình sao của sản phẩm
- 💬 Hiển thị danh sách đánh giá từ người khác
