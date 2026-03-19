# 📝 Hướng Dẫn API Đánh Giá Đơn Hàng

## Tổng Quan

Hệ thống đánh giá cho phép người dùng:
- ⭐ Đánh giá sản phẩm từ 1-5 sao
- 💬 Viết nhận xét chi tiết
- 📊 Xem thống kê đánh giá sản phẩm
- ✏️ Chỉnh sửa đánh giá của mình
- 🗑️ Xóa đánh giá

---

## API Endpoints

### 1️⃣ Tạo Đánh Giá

**Endpoint**: `POST /api/reviews/create`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body**:
```json
{
  "order_detail_id": 1,
  "rating": 5,
  "comment": "Sản phẩm rất tốt, giao hàng nhanh chóng và đóng gói cẩn thận!"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Đánh giá thành công!",
  "data": {
    "id": 1,
    "order_detail_id": 1,
    "rating": 5,
    "comment": "Sản phẩm rất tốt, giao hàng nhanh chóng và đóng gói cẩn thận!",
    "created_at": "2026-03-05T10:30:00.000Z",
    "status": 1
  }
}
```

**Validation Rules**:
- `order_detail_id`: Bắt buộc, phải tồn tại
- `rating`: 1-5 sao, bắt buộc
- `comment`: 1-1000 ký tự, bắt buộc
- Chỉ có thể đánh giá sản phẩm từ đơn hàng **đã giao**
- **Mỗi sản phẩm chỉ đánh giá một lần**

**Lỗi Có Thể Xảy Ra**:
```json
{
  "success": false,
  "message": "Chi tiết đơn hàng không tồn tại"
}
```
```json
{
  "success": false,
  "message": "Chỉ có thể đánh giá sản phẩm từ đơn hàng đã giao"
}
```
```json
{
  "success": false,
  "message": "Bạn đã đánh giá sản phẩm này rồi"
}
```

---

### 2️⃣ Lấy Đánh Giá Của Một Sản Phẩm

**Endpoint**: `GET /api/reviews/product`

**Query Parameters**:
| Parameter | Type | Required | Mô Tả |
|-----------|------|----------|-------|
| `variant_id` | Integer | Có | ID variant sản phẩm |
| `page` | Integer | Không | Trang (mặc định: 1) |
| `limit` | Integer | Không | Số item trên trang (mặc định: 10) |

**Example**:
```
GET /api/reviews/product?variant_id=1&page=1&limit=10
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "order_detail_id": 1,
        "rating": 5,
        "comment": "Sản phẩm rất tốt!",
        "created_at": "2026-03-05T10:30:00.000Z",
        "status": 1,
        "orderDetail": {
          "id": 1,
          "order_id": 1,
          "variant_id": 1,
          "quantity": 2,
          "price": 500000
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "limit": 10,
      "total": 25,
      "total_pages": 3
    },
    "stats": {
      "total_reviews": 25,
      "avg_rating": "4.7",
      "rating_distribution": {
        "5_star": 20,
        "4_star": 4,
        "3_star": 1,
        "2_star": 0,
        "1_star": 0
      }
    }
  }
}
```

---

### 3️⃣ Lấy Đánh Giá Của Một Đơn Hàng

**Endpoint**: `GET /api/reviews/order/:order_id`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN
```

**Example**:
```
GET /api/reviews/order/5
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_detail_id": 1,
      "rating": 5,
      "comment": "Sản phẩm A rất tốt!",
      "created_at": "2026-03-05T10:30:00.000Z",
      "status": 1
    },
    {
      "id": 2,
      "order_detail_id": 2,
      "rating": 4,
      "comment": "Sản phẩm B cũng được!",
      "created_at": "2026-03-05T10:32:00.000Z",
      "status": 1
    }
  ]
}
```

---

### 4️⃣ Cập Nhật Đánh Giá

**Endpoint**: `PUT /api/reviews/update/:review_id`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body** (cập nhật một hoặc cả hai):
```json
{
  "rating": 4,
  "comment": "Chất lượng tốt nhưng giao chậm một chút"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Cập nhật đánh giá thành công!",
  "data": {
    "id": 1,
    "order_detail_id": 1,
    "rating": 4,
    "comment": "Chất lượng tốt nhưng giao chậm một chút",
    "created_at": "2026-03-05T10:30:00.000Z",
    "status": 1
  }
}
```

---

### 5️⃣ Xóa Đánh Giá

**Endpoint**: `DELETE /api/reviews/delete/:review_id`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Xóa đánh giá thành công!"
}
```

**Lưu ý**: Xóa là "soft delete" - đánh giá vẫn lưu trong DB nhưng không hiển thị

---

## 📊 Thống Kê Đánh Giá

Khi lấy đánh giá sản phẩm, bạn sẽ nhận được thống kê:

```json
"stats": {
  "total_reviews": 25,           // Tổng số đánh giá
  "avg_rating": "4.7",           // Trung bình sao
  "rating_distribution": {
    "5_star": 20,                // Số đánh giá 5 sao
    "4_star": 4,
    "3_star": 1,
    "2_star": 0,
    "1_star": 0
  }
}
```

---

## 🔐 Yêu Cầu Bảo Mật

- ✅ Đăng nhập bắt buộc cho: tạo, cập nhật, xóa đánh giá
- ✅ Xem đánh giá sản phẩm: công khai (không cần token)
- ✅ Xem đánh giá đơn hàng: chỉ chủ nhân đơn hàng
- ✅ Cập nhật/xóa: chỉ tác giả của đánh giá

---

## 📋 Điều Kiện Đánh Giá

1. **Đơn hàng phải đã giao** (status = 'delivered')
2. **Mỗi sản phẩm chỉ đánh giá một lần**
3. **Rating phải từ 1-5 sao**
4. **Comment tối thiểu 1 ký tự, tối đa 1000 ký tự**

---

## 🧪 Test với Postman

### Step 1: Lấy Token
```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
```
Copy `token` từ response

### Step 2: Tạo Đánh Giá
```
POST /api/reviews/create
Headers:
  Authorization: Bearer [TOKEN_FROM_STEP_1]
  Content-Type: application/json

Body: {
  "order_detail_id": 1,
  "rating": 5,
  "comment": "Sản phẩm rất tốt!"
}
```

### Step 3: Xem Đánh Giá Sản Phẩm
```
GET /api/reviews/product?variant_id=1&page=1&limit=10
```

### Step 4: Xem Đánh Giá Đơn Hàng
```
GET /api/reviews/order/1
Headers:
  Authorization: Bearer [TOKEN_FROM_STEP_1]
```

### Step 5: Cập Nhật Đánh Giá
```
PUT /api/reviews/update/1
Headers:
  Authorization: Bearer [TOKEN_FROM_STEP_1]
  Content-Type: application/json

Body: {
  "rating": 4,
  "comment": "Cập nhật nhận xét mới"
}
```

### Step 6: Xóa Đánh Giá
```
DELETE /api/reviews/delete/1
Headers:
  Authorization: Bearer [TOKEN_FROM_STEP_1]
```

---

## 💾 Cấu Trúc Database

Bảng `order_reviews`:
```sql
CREATE TABLE order_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_detail_id INT,
  rating INT (1-5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TINYINT DEFAULT 1,
  FOREIGN KEY (order_detail_id) REFERENCES order_details(id)
);
```

---

## 🎯 Use Cases

### Use Case 1: Người dùng đánh giá sản phẩm
```
1. Người dùng nhận được đơn hàng
2. Status đơn hàng thay đổi thành "delivered"
3. Người dùng gọi API tạo đánh giá
4. Đánh giá được lưu và hiển thị cho người khác
```

### Use Case 2: Khách hàng xem đánh giá sản phẩm
```
1. Khách hàng truy cập trang sản phẩm
2. Gọi API lấy đánh giá (variant_id)
3. Hiển thị danh sách đánh giá + thống kê
4. Khách hàng quyết định mua hay không
```

### Use Case 3: Người dùng chỉnh sửa đánh giá
```
1. Người dùng đã đánh giá sản phẩm
2. Muốn thay đổi rating hoặc comment
3. Gọi API cập nhật đánh giá
4. Đánh giá được cập nhật
```

---

## ❓ FAQ

**Q: Có thể đánh giá sản phẩm mà chưa nhận được không?**
A: Không, chỉ có thể đánh giá khi đơn hàng status = "delivered"

**Q: Có thể đánh giá cùng một sản phẩm nhiều lần không?**
A: Không, mỗi sản phẩm trong mỗi đơn hàng chỉ đánh giá một lần

**Q: Có thể xóa đánh giá không?**
A: Có, dùng API DELETE /api/reviews/delete/:review_id

**Q: Ai có thể thấy đánh giá của tôi?**
A: Tất cả mọi người có thể thấy (public) khi xem đánh giá sản phẩm

**Q: Có thể thay đổi ngày tạo đánh giá không?**
A: Không, ngày tạo được thiết lập tự động

---

**✅ Hoàn thành! API đánh giá đã sẵn sàng sử dụng.**
