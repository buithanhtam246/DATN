# Hướng Dẫn Test API với Postman

## 1. Chuẩn Bị

### Bước 1: Tải Postman
- Tải từ: https://www.postman.com/downloads/
- Cài đặt và mở ứng dụng

### Bước 2: Khởi động Server
```bash
cd d:\FPT\DATN\BE
npm start
```
Server sẽ chạy tại: `http://localhost:3000`

---

## 2. Test API Checkout

### Bước 1: Tạo Request Mới
1. Mở Postman
2. Click **"+"** để tạo tab mới
3. Chọn **POST** từ dropdown
4. Nhập URL: `http://localhost:3000/api/orders/checkout`

### Bước 2: Thiết Lập Headers
Click tab **Headers** và thêm:

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer YOUR_TOKEN_HERE` |

**Lưu ý**: Thay `YOUR_TOKEN_HERE` bằng token từ API login

#### Cách lấy Token:
1. **Test API Login trước**:
   - URL: `POST http://localhost:3000/api/auth/login`
   - Body (raw JSON):
   ```json
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```
   - Copy `token` từ response

### Bước 3: Thiết Lập Body
1. Click tab **Body**
2. Chọn **raw**
3. Chọn **JSON** từ dropdown
4. Paste dữ liệu sau:

```json
{
  "address_id": 4,
  "payment_method_id": 1,
  "voucher_code": "SAVE100K",
  "delivery": "Standard",
  "delivery_cost": 30000,
  "note": "Giao sáng mai",
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

### Bước 4: Click Send
Nhấn nút **Send** để gửi request

---

## 3. Giải Thích Các Trường

| Trường | Kiểu | Yêu Cầu | Mô Tả |
|--------|------|---------|-------|
| `address_id` | Integer | Bắt buộc | ID địa chỉ giao hàng |
| `payment_method_id` | Integer | Bắt buộc | ID phương thức thanh toán |
| `voucher_code` | String | Tùy chọn | Mã voucher giảm giá |
| `delivery` | String | Tùy chọn | Loại giao hàng (Standard, Express, etc) |
| `delivery_cost` | Decimal | Tùy chọn | Chi phí giao hàng (mặc định 30000) |
| `note` | String | Tùy chọn | Ghi chú đơn hàng |
| `items` | Array | Bắt buộc | Danh sách sản phẩm |
| `items[].variant_id` | Integer | Bắt buộc | ID variant sản phẩm |
| `items[].price` | Decimal | Bắt buộc | Giá của variant |
| `items[].quantity` | Integer | Bắt buộc | Số lượng |

---

## 4. Response Mong Đợi

### Thành Công (200 OK):
```json
{
  "success": true,
  "message": "Đặt hàng thành công!",
  "data": {
    "id": 1,
    "user_id": 1,
    "address_id": 4,
    "total_price": 1260000,
    "delivery_cost": 30000,
    "status": "pending",
    "payment_method_id": 1,
    "voucher_id": 1,
    "note": "Giao sáng mai",
    "delivery": "Standard",
    "create_at": "2026-03-05T10:30:00.000Z",
    "subtotal": 1300000,
    "discount_amount": 40000,
    "delivery_cost": 30000,
    "total_price": 1290000
  }
}
```

### Lỗi (500 Internal Server Error):
```json
{
  "success": false,
  "message": "Unknown column 'address_id' in 'field list'"
}
```
**Giải pháp**: Đã fix bằng cách thêm cột address_id vào bảng orders

---

## 5. Các API Test Khác

### 5.1 API Đăng Ký
**POST** `http://localhost:3000/api/auth/register`

```json
{
  "fullname": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### 5.2 API Đăng Nhập
**POST** `http://localhost:3000/api/auth/login`

```json
{
  "email": "nguyenvana@example.com",
  "password": "password123"
}
```

### 5.3 API Xem Danh Sách Voucher
**GET** `http://localhost:3000/api/vouchers`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 5.4 API Tạo Địa Chỉ
**POST** `http://localhost:3000/api/addresses`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Body:
```json
{
  "receiver_name": "Nguyễn Văn A",
  "receiver_phone": "0123456789",
  "full_address": "123 Đường ABC, Quận 1, TP.HCM",
  "is_default": false
}
```

---

## 6. Tips Sử Dụng Postman

### Lưu Collection
1. Click **File** → **New Collection**
2. Đặt tên: "DATN API Tests"
3. Thêm các request vào collection
4. Click **Save** để lưu

### Sử Dụng Environment Variables
1. Click **Settings** (bánh răng) → **Environments**
2. Click **"+"** để tạo environment mới
3. Thêm biến:
   ```
   base_url: http://localhost:3000
   token: YOUR_TOKEN_HERE
   ```
4. Dùng trong request: `{{base_url}}/api/orders/checkout`

### Kiểm Tra Response
- **Status**: Nên là 200, 201 cho thành công
- **Body**: Kiểm tra `success: true`
- **Time**: Xem tốc độ response

---

## 7. Troubleshooting

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|----------|
| Connection refused | Server không chạy | Chạy `npm start` trong BE |
| Invalid token | Token hết hạn/sai | Lấy token mới từ login |
| Address_id not found | DB chưa sync | Chạy `node fixOrdersTable.js` |
| 404 Not Found | URL sai | Kiểm tra đúng endpoint |
| CORS error | Origin không được phép | Thêm CORS headers |

---

## 8. Dòng Chảy Test Hoàn Chỉnh

```
1. Đăng Ký (Register)
   ↓
2. Đăng Nhập (Login) → Lấy Token
   ↓
3. Tạo Địa Chỉ (Create Address) → Lấy Address ID
   ↓
4. Xem Voucher (Get Vouchers) → Chọn mã Voucher
   ↓
5. Đặt Hàng (Checkout) ✓
```

---

**Chúc bạn test thành công! 🎉**
