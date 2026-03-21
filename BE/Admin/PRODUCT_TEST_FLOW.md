# 📋 Flow Test Thêm Products - Postman Guide

## 🎯 Mục Đích
Hướng dẫn chi tiết để test API thêm sản phẩm với variants đầy đủ (colors, sizes, giá, số lượng)

---

## 📌 Yêu Cầu Chuẩn Bị

1. **Server đang chạy**: `node server.js` trong thư mục `BE/Admin`
2. **Postman**: Đã cài đặt
3. **Database**: Đã có dữ liệu `brand`, `color`, `size`

---

## ✅ Step 1: Kiểm Tra Dữ Liệu Cơ Sở

### 1.1 Lấy Danh Sách Brand
```
GET http://localhost:3000/admin/brands
```
**Response mong đợi:**
```json
[
  { "id": 1, "name": "Nike" },
  { "id": 2, "name": "Adidas" }
]
```

### 1.2 Lấy Danh Sách Color
```
GET http://localhost:3000/admin/colors
```
**Response mong đợi:**
```json
[
  { "id": 1, "table_color": "#FF6B6B" },
  { "id": 2, "table_color": "#4ECDC4" }
]
```

### 1.3 Lấy Danh Sách Size
```
GET http://localhost:3000/admin/sizes
```
**Response mong đợi:**
```json
[
  { "size_id": 1, "bang_size": "S" },
  { "size_id": 2, "bang_size": "M" },
  { "size_id": 3, "bang_size": "L" }
]
```

> ⚠️ Ghi chú ID của brands, colors, sizes để dùng trong bước tiếp theo

---

## 🚀 Step 2: Thêm Product (Cách 1 - Với Form Data)

### Request Details
```
Method: POST
URL: http://localhost:3000/admin/products
Content-Type: form-data
```

### Body (form-data):

| Key | Type | Value | Mô Tả |
|-----|------|-------|-------|
| `name` | text | Nike Air Max 270 | Tên sản phẩm |
| `describ` | text | Giày thể thao cao cấp | Mô tả sản phẩm |
| `brand_id` | text | 1 | ID nhãn hiệu |
| `categories_id` | text | 1 | ID danh mục |
| `image` | file | (chọn file ảnh) | Ảnh sản phẩm |
| `colors` | text | [1,2] | Mảng color IDs (JSON format) |
| `sizes` | text | [1,2,3] | Mảng size IDs (JSON format) |
| `variantDetails` | text | (xem bên dưới) | Chi tiết variants |

### variantDetails (JSON Format):
```json
[
  {
    "colorId": 1,
    "sizeId": 1,
    "price": 2500000,
    "priceSale": 2000000,
    "quantity": 10,
    "image": null
  },
  {
    "colorId": 1,
    "sizeId": 2,
    "price": 2500000,
    "priceSale": 2000000,
    "quantity": 15,
    "image": null
  },
  {
    "colorId": 2,
    "sizeId": 1,
    "price": 2500000,
    "priceSale": 2100000,
    "quantity": 8,
    "image": null
  }
]
```

### Postman Setup:
1. Chọn **Body** → **form-data**
2. Điền các field text
3. Cho `image`: chọn **File** type và upload file ảnh
4. Cho `colors`, `sizes`, `variantDetails`: điền JSON dưới dạng text

### Expected Response:
```json
{
  "success": true,
  "productId": 5
}
```

---

## 🚀 Step 3: Thêm Product (Cách 2 - Raw JSON)

Nếu không upload ảnh, có thể dùng JSON:

```
Method: POST
URL: http://localhost:3000/admin/products
Content-Type: application/json
```

### Body (raw JSON):
```json
{
  "name": "Adidas Ultraboost 22",
  "describ": "Giày chạy bộ tối ưu",
  "brand_id": 2,
  "categories_id": 1,
  "image": "/uploads/existing-image.jpg",
  "colors": [1, 2],
  "sizes": [2, 3],
  "variantDetails": [
    {
      "colorId": 1,
      "sizeId": 2,
      "price": 3000000,
      "priceSale": 2400000,
      "quantity": 20,
      "image": null
    },
    {
      "colorId": 1,
      "sizeId": 3,
      "price": 3000000,
      "priceSale": 2400000,
      "quantity": 25,
      "image": null
    },
    {
      "colorId": 2,
      "sizeId": 2,
      "price": 3000000,
      "priceSale": 2500000,
      "quantity": 18,
      "image": null
    }
  ]
}
```

### Expected Response:
```json
{
  "success": true,
  "productId": 6
}
```

---

## ✨ Step 4: Xác Nhận Variants Được Tạo

### Request Details
```
Method: GET
URL: http://localhost:3000/admin/products/{productId}
Ví dụ: http://localhost:3000/admin/products/5
```

### Expected Response:
```json
{
  "id": 5,
  "name": "Nike Air Max 270",
  "description": "Giày thể thao cao cấp",
  "image": "/uploads/default-product.jpg",
  "brand": "Nike",
  "colors": [
    {
      "colorId": 1,
      "colorCode": "#FF6B6B",
      "image": "/uploads/...",
      "sizes": [
        {
          "sizeId": 1,
          "sizeName": "S",
          "variantId": 15,
          "price": 2500000,
          "priceSale": 2000000,
          "quantity": 10
        },
        {
          "sizeId": 2,
          "sizeName": "M",
          "variantId": 16,
          "price": 2500000,
          "priceSale": 2000000,
          "quantity": 15
        }
      ]
    },
    {
      "colorId": 2,
      "colorCode": "#4ECDC4",
      "image": "/uploads/...",
      "sizes": [
        {
          "sizeId": 1,
          "sizeName": "S",
          "variantId": 17,
          "price": 2500000,
          "priceSale": 2100000,
          "quantity": 8
        }
      ]
    }
  ]
}
```

✅ Nếu có `colors` → `sizes` → `variantId`, `price`, `priceSale`, `quantity` thì **thành công!**

---

## 📊 Endpoint Generate Variants Riêng

Nếu bạn đã có product nhưng muốn thêm variants sau:

```
Method: POST
URL: http://localhost:3000/admin/products/generate-variants
Content-Type: application/json
```

### Body:
```json
{
  "productId": 5,
  "colors": [1, 3],
  "sizes": [1, 2, 3],
  "variantDetails": [
    {
      "colorId": 1,
      "sizeId": 1,
      "price": 2500000,
      "priceSale": 2000000,
      "quantity": 10,
      "image": null
    },
    {
      "colorId": 1,
      "sizeId": 2,
      "price": 2500000,
      "priceSale": 2000000,
      "quantity": 15,
      "image": null
    }
  ]
}
```

### Expected Response:
```json
{
  "success": true,
  "message": "Variants created"
}
```

---

## 🔄 Update Variant (Cập Nhật Giá, Số Lượng)

Nếu cần thay đổi giá hoặc số lượng của variant:

```
Method: PUT
URL: http://localhost:3000/admin/products/variants/{variantId}
Ví dụ: http://localhost:3000/admin/products/variants/15
Content-Type: application/json
```

### Body:
```json
{
  "price": 2600000,
  "priceSale": 2100000,
  "quantity": 20,
  "image": null
}
```

### Expected Response:
```json
{
  "success": true,
  "message": "Variant updated"
}
```

---

## 🧪 Dữ Liệu Test Mẫu

### Product 1: Nike Giá Cao
```json
{
  "name": "Nike Air Jordan 1",
  "describ": "Giày bóng rổ huyền thoại",
  "brand_id": 1,
  "categories_id": 1,
  "image": "/uploads/nike-air-jordan.jpg",
  "colors": [1, 2],
  "sizes": [1, 2, 3],
  "variantDetails": [
    {"colorId": 1, "sizeId": 1, "price": 5000000, "priceSale": 4000000, "quantity": 5},
    {"colorId": 1, "sizeId": 2, "price": 5000000, "priceSale": 4000000, "quantity": 8},
    {"colorId": 1, "sizeId": 3, "price": 5000000, "priceSale": 4000000, "quantity": 6},
    {"colorId": 2, "sizeId": 1, "price": 5200000, "priceSale": 4200000, "quantity": 4},
    {"colorId": 2, "sizeId": 2, "price": 5200000, "priceSale": 4200000, "quantity": 7},
    {"colorId": 2, "sizeId": 3, "price": 5200000, "priceSale": 4200000, "quantity": 5}
  ]
}
```

### Product 2: Adidas Giá Trung Bình
```json
{
  "name": "Adidas Superstar",
  "describ": "Giày thời trang cổ điển",
  "brand_id": 2,
  "categories_id": 2,
  "image": "/uploads/adidas-superstar.jpg",
  "colors": [1],
  "sizes": [1, 2, 3],
  "variantDetails": [
    {"colorId": 1, "sizeId": 1, "price": 2000000, "priceSale": 1600000, "quantity": 20},
    {"colorId": 1, "sizeId": 2, "price": 2000000, "priceSale": 1600000, "quantity": 25},
    {"colorId": 1, "sizeId": 3, "price": 2000000, "priceSale": 1600000, "quantity": 18}
  ]
}
```

---

## ⚠️ Troubleshooting

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|------------|----------|
| `Cannot POST /admin/products` | Server chưa chạy | `node server.js` trong `BE/Admin` |
| `Server error 500` | Database lỗi | Kiểm tra kết nối MySQL |
| `Variants không tạo` | colors/sizes IDs sai | Kiểm tra GET endpoints ở Step 1 |
| `price_sale = null` | variantDetails sai format | Dùng JSON format đúng |
| `Ảnh không upload` | File size > 5MB hoặc format sai | Dùng ảnh < 5MB (.jpg, .png) |

---

## 🎉 Success Checklist

- ✅ Server đang chạy
- ✅ Brands/Colors/Sizes có data
- ✅ POST /admin/products trả về `productId`
- ✅ GET /admin/products/{id} hiển thị đúng colors → sizes → variants
- ✅ Mỗi variant có `price`, `priceSale`, `quantity`
- ✅ Hình ảnh upload thành công

---

**Nếu mọi thứ OK → Ready for production! 🚀**
