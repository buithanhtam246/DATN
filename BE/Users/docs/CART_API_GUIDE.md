# 🛒 Hướng Dẫn Test API Giỏ Hàng với Postman

## 📝 Các API Endpoint

### 1️⃣ **Tạo Giỏ Hàng Mới**
```
POST /api/cart/create
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "user_id": 1
}
```

**Note:** `user_id` là optional - nếu không truyền thì giỏ hàng sẽ dành cho khách vãng lai

**Response:**
```json
{
  "success": true,
  "message": "Cart created successfully",
  "data": {
    "cart_id": 1,
    "user_id": 1,
    "status": 1
  }
}
```

---

### 2️⃣ **Thêm Sản Phẩm Vào Giỏ**
```
POST /api/cart/add
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "cart_id": 1,
  "variant_id": 5,
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product added to cart successfully",
  "data": {
    "item_id": 1,
    "cart_id": 1,
    "variant_id": 5,
    "quantity": 2
  }
}
```

**Note:** Nếu sản phẩm đã có trong giỏ, số lượng sẽ được cộng thêm

---

### 3️⃣ **Lấy Chi Tiết Giỏ Hàng**
```
GET /api/cart?cart_id=1
```

**Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
- `cart_id`: ID của giỏ hàng

**Response:**
```json
{
  "success": true,
  "data": {
    "cart_id": 1,
    "items": [
      {
        "id": 1,
        "cart_id": 1,
        "variant_id": 5,
        "quantity": 2,
        "product_name": "Áo thun",
        "image": "image_url",
        "original_price": 150000
      }
    ],
    "total_items": 1
  }
}
```

---

### 4️⃣ **Cập Nhật Số Lượng Sản Phẩm**
```
PUT /api/cart/update/1
```

**Headers:**
```
Content-Type: application/json
```

**Path Parameters:**
- `itemId`: ID của item trong giỏ (vd: 1)

**Body (JSON):**
```json
{
  "quantity": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "item_id": 1,
    "quantity": 5
  }
}
```

---

### 5️⃣ **Xóa Sản Phẩm Khỏi Giỏ**
```
DELETE /api/cart/remove/1
```

**Headers:**
```
Content-Type: application/json
```

**Path Parameters:**
- `itemId`: ID của item cần xóa (vd: 1)

**Response:**
```json
{
  "success": true,
  "message": "Product removed from cart successfully"
}
```

---

### 6️⃣ **Xóa Toàn Bộ Giỏ Hàng**
```
DELETE /api/cart/clear
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "cart_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

### 7️⃣ **Tính Tổng Giá Giỏ Hàng**
```
GET /api/cart/total?cart_id=1
```

**Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
- `cart_id`: ID của giỏ hàng

**Response:**
```json
{
  "success": true,
  "data": {
    "cart_id": 1,
    "total_price": 300000
  }
}
```

---

## 🧪 Quy Trình Test Từng Bước

### Step 1: Tạo Giỏ Hàng
```bash
POST http://localhost:3000/api/cart/create
Body:
{
  "user_id": 1
}
```
💾 **Lưu `cart_id` từ response để dùng ở các bước tiếp theo**

### Step 2: Thêm Sản Phẩm (Lần 1)
```bash
POST http://localhost:3000/api/cart/add
Body:
{
  "cart_id": 1,
  "variant_id": 5,
  "quantity": 2
}
```

### Step 3: Thêm Sản Phẩm (Lần 2)
```bash
POST http://localhost:3000/api/cart/add
Body:
{
  "cart_id": 1,
  "variant_id": 10,
  "quantity": 1
}
```

### Step 4: Xem Giỏ Hàng
```bash
GET http://localhost:3000/api/cart?cart_id=1
```

### Step 5: Tính Tổng
```bash
GET http://localhost:3000/api/cart/total?cart_id=1
```

### Step 6: Cập Nhật Số Lượng
```bash
PUT http://localhost:3000/api/cart/update/1
Body:
{
  "quantity": 3
}
```

### Step 7: Xóa Sản Phẩm
```bash
DELETE http://localhost:3000/api/cart/remove/1
```

---

## ⚠️ Lỗi Có Thể Gặp

| Code | Lỗi | Giải Pháp |
|------|-----|---------|
| 400 | Missing required fields | Kiểm tra body request có đủ các field không |
| 404 | Cart not found | Kiểm tra cart_id có tồn tại không |
| 404 | Variant not found | Kiểm tra variant_id có tồn tại không |
| 500 | Server error | Kiểm tra database connection |

---

## 📌 Notes
- **Không cần authentication** để sử dụng API giỏ hàng
- **user_id là optional** - có thể tạo giỏ hàng cho khách vãng lai
- Khi thêm sản phẩm **đã có trong giỏ**, số lượng sẽ được **cộng thêm**
- Số lượng tối thiểu phải là **1 trở lên**
- Query parameter và body request đều hỗ trợ `cart_id`
