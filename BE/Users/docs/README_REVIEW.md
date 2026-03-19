# 🎉 DATN Backend - Phần Đánh Giá Đơn Hàng

## 📚 Tài Liệu Nhanh

| Tài Liệu | Mục Đích |
|---------|---------|
| **REVIEW_SUMMARY.md** | 📋 Tóm tắt tất cả những gì đã thực hiện |
| **REVIEW_API_GUIDE.md** | 📖 Hướng dẫn chi tiết từng API endpoint |
| **POSTMAN_TEST_GUIDE.md** | 🧪 Hướng dẫn test với Postman |

---

## 🚀 Khởi Động Nhanh

### 1️⃣ Khởi Động Server
```bash
cd d:\FPT\DATN\BE
npm start
```

Server sẽ chạy tại: **http://localhost:3000**

### 2️⃣ Test API (Tự động)
```bash
node testReviewAPI.js
```

### 3️⃣ Test API (Manual - Postman)
Mở file **POSTMAN_TEST_GUIDE.md** để xem hướng dẫn chi tiết

---

## 📁 Cấu Trúc Các File Tạo Mới

```
BE/
├── Users/
│   ├── controller/
│   │   └── review.controller.js      ✨ Xử lý HTTP requests
│   ├── service/
│   │   └── review.service.js         ✨ Logic xử lý đánh giá
│   ├── repository/
│   │   └── review.repository.js      ✨ Tương tác database
│   └── router/
│       └── review.router.js          ✨ Định nghĩa routes
├── testReviewAPI.js                   ✨ Script test tự động
├── checkReviewTable.js                ✨ Kiểm tra/tạo bảng review
├── REVIEW_SUMMARY.md                  ✨ Tóm tắt hoàn thành
├── REVIEW_API_GUIDE.md                ✨ Hướng dẫn API chi tiết
├── POSTMAN_TEST_GUIDE.md              ✨ Hướng dẫn Postman
└── server.js                          📝 Cập nhật (thêm review router)
```

---

## 🎯 API Endpoints

| Phương Thức | Endpoint | Mô Tả | Auth |
|-------------|----------|-------|------|
| **POST** | `/api/reviews/create` | Tạo đánh giá | ✅ |
| **GET** | `/api/reviews/product` | Lấy đánh giá sản phẩm | ❌ |
| **GET** | `/api/reviews/order/:id` | Lấy đánh giá đơn hàng | ✅ |
| **PUT** | `/api/reviews/update/:id` | Cập nhật đánh giá | ✅ |
| **DELETE** | `/api/reviews/delete/:id` | Xóa đánh giá | ✅ |

---

## ✨ Tính Năng

✅ **Tạo đánh giá** - Đánh giá 1-5 sao + comment
✅ **Xem công khai** - Mọi người xem được đánh giá sản phẩm
✅ **Thống kê** - Trung bình sao, phân bố rating
✅ **Chỉnh sửa** - User cập nhật đánh giá của mình
✅ **Xóa** - User xóa đánh giá (soft delete)
✅ **Phân trang** - Danh sách đánh giá có pagination
✅ **Bảo mật** - Kiểm tra quyền chủ sở hữu

---

## 🔐 Validation & Bảo Mật

| Quy Tắc | Chi Tiết |
|---------|----------|
| **Auth** | Yêu cầu token để tạo/sửa/xóa |
| **Authorization** | Chỉ chủ nhân được phép sửa/xóa |
| **Order Status** | Chỉ đánh giá đơn hàng "delivered" |
| **Unique** | Mỗi sản phẩm đánh giá 1 lần |
| **Rating** | 1-5 sao bắt buộc |
| **Comment** | 1-1000 ký tự bắt buộc |

---

## 🧪 Ví Dụ Test

### Test 1: Tạo Đánh Giá
```bash
curl -X POST http://localhost:3000/api/reviews/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_detail_id": 1,
    "rating": 5,
    "comment": "Sản phẩm rất tốt!"
  }'
```

### Test 2: Xem Đánh Giá Sản Phẩm
```bash
curl http://localhost:3000/api/reviews/product?variant_id=1&page=1&limit=10
```

### Test 3: Xem Đánh Giá Đơn Hàng
```bash
curl -X GET http://localhost:3000/api/reviews/order/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Response Mẫu

### ✅ Tạo Đánh Giá Thành Công
```json
{
  "success": true,
  "message": "Đánh giá thành công!",
  "data": {
    "id": 1,
    "order_detail_id": 1,
    "rating": 5,
    "comment": "Sản phẩm rất tốt!",
    "created_at": "2026-03-05T10:30:00.000Z",
    "status": 1
  }
}
```

### ✅ Lấy Đánh Giá Sản Phẩm
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Tuyệt vời!",
        "created_at": "2026-03-05T10:30:00.000Z"
      }
    ],
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

### ❌ Lỗi - Không Thể Đánh Giá
```json
{
  "success": false,
  "message": "Chỉ có thể đánh giá sản phẩm từ đơn hàng đã giao"
}
```

---

## 🐛 Troubleshooting

| Lỗi | Giải Pháp |
|-----|----------|
| "Chi tiết đơn hàng không tồn tại" | Kiểm tra order_detail_id đúng |
| "Bạn đã đánh giá sản phẩm này rồi" | Mỗi sản phẩm chỉ đánh giá 1 lần |
| "Chỉ có thể đánh giá từ đơn hàng đã giao" | Thay đổi order status = "delivered" |
| "Token hết hạn" | Lấy token mới từ login |
| "Bạn không có quyền" | Kiểm tra đó là đánh giá của bạn |

---

## 📋 Checklist

- ✅ Repository đã tạo (`review.repository.js`)
- ✅ Service đã tạo (`review.service.js`)
- ✅ Controller đã tạo (`review.controller.js`)
- ✅ Router đã tạo (`review.router.js`)
- ✅ Server đã cập nhật (thêm review routes)
- ✅ Database đã kiểm tra (`order_reviews` table tồn tại)
- ✅ Validation đầy đủ
- ✅ Test script tạo (`testReviewAPI.js`)
- ✅ Tài liệu chi tiết
- ✅ Hướng dẫn Postman

---

## 📞 Cần Giúp?

### Xem Tài Liệu
1. **REVIEW_SUMMARY.md** - Tóm tắt chi tiết
2. **REVIEW_API_GUIDE.md** - Hướng dẫn từng endpoint
3. **POSTMAN_TEST_GUIDE.md** - Hướng dẫn test

### Test Nhanh
```bash
npm start                    # Khởi động server
# Mở terminal khác
node testReviewAPI.js        # Chạy test
```

### Check Database
```bash
node checkReviewTable.js
```

---

## 🎓 Cấu Trúc MVC

```
Request
  ↓
Router (review.router.js)
  ↓
Controller (review.controller.js) - Xử lý HTTP
  ↓
Service (review.service.js) - Business Logic
  ↓
Repository (review.repository.js) - Database Query
  ↓
Database (order_reviews table)
```

---

**✅ Phần Đánh Giá Đơn Hàng - Hoàn Thành & Sẵn Sàng Sử Dụng!** 🚀
