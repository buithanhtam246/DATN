# Backend Structure - Color & Size Management

## 📁 Cấu trúc Backend cho Color & Size

### Controllers (Xử lý logic)

#### 1. **color.controller.js** - Xử lý tất cả logic màu sắc
```
Đường dẫn: BE/Admin/controller_admin/color.controller.js
```
- ✅ `getColors()` - Lấy tất cả màu
- ✅ `addColor()` - Thêm màu mới
- ✅ `updateColor()` - Cập nhật màu
- ✅ `deleteColor()` - Xóa màu

#### 2. **size.controller.js** - Xử lý tất cả logic kích thước
```
Đường dẫn: BE/Admin/controller_admin/size.controller.js
```
- ✅ `getSizes()` - Lấy tất cả size
- ✅ `addSize()` - Thêm size mới
- ✅ `updateSize()` - Cập nhật size
- ✅ `deleteSize()` - Xóa size

### Routes (Định tuyến API)

#### 1. **color.routes.js** - API endpoints cho Color
```
Đường dẫn: BE/Admin/router_admin/color.routes.js
```
- `GET /api/admin/colors` - Lấy tất cả
- `POST /api/admin/colors` - Thêm mới
- `PUT /api/admin/colors/:id` - Cập nhật
- `DELETE /api/admin/colors/:id` - Xóa

#### 2. **size.routes.js** - API endpoints cho Size
```
Đường dẫn: BE/Admin/router_admin/size.routes.js
```
- `GET /api/admin/sizes` - Lấy tất cả
- `POST /api/admin/sizes` - Thêm mới
- `PUT /api/admin/sizes/:id` - Cập nhật
- `DELETE /api/admin/sizes/:id` - Xóa

### Server Configuration

#### **server.js** - Đăng ký routes
```javascript
// Admin Routes
app.use('/api/admin/colors', require('./Admin/router_admin/color.routes'));
app.use('/api/admin/sizes', require('./Admin/router_admin/size.routes'));
```

---

## 📊 Ví dụ API Calls

### Color API

```bash
# Lấy tất cả màu
GET http://localhost:3000/api/admin/colors

# Thêm màu mới
POST http://localhost:3000/api/admin/colors
{
  "name": "Đen",
  "hex_code": "#000000"
}

# Cập nhật màu
PUT http://localhost:3000/api/admin/colors/1
{
  "name": "Đen Sâu",
  "hex_code": "#111111"
}

# Xóa màu
DELETE http://localhost:3000/api/admin/colors/1
```

### Size API

```bash
# Lấy tất cả size
GET http://localhost:3000/api/admin/sizes

# Thêm size mới
POST http://localhost:3000/api/admin/sizes
{
  "size": 37
}

# Cập nhật size
PUT http://localhost:3000/api/admin/sizes/1
{
  "size": 38
}

# Xóa size
DELETE http://localhost:3000/api/admin/sizes/1
```

---

## 📋 Files tách riêng

| File | Loại | Mục đích |
|------|------|---------|
| `color.controller.js` | Controller | Xử lý logic màu sắc |
| `size.controller.js` | Controller | Xử lý logic kích thước |
| `color.routes.js` | Routes | Định tuyến API màu |
| `size.routes.js` | Routes | Định tuyến API size |

---

## ⚠️ Files cũ (Không dùng nữa)

❌ `color-size.controller.js` - **ĐÃ TÁCH RIÊNG** (xóa bỏ)
❌ `color-size.routes.js` - **ĐÃ TÁCH RIÊNG** (xóa bỏ)

---

## 🔄 Flow Dữ Liệu

```
Frontend Component (colors.component.ts)
    ↓
ProductService (getColors(), addColor()...)
    ↓
HTTP Request → /api/admin/colors
    ↓
Server.js (Định tuyến)
    ↓
color.routes.js (Router)
    ↓
color.controller.js (Logic xử lý)
    ↓
Database (color table)
```

---

## ✅ Lợi ích của việc tách riêng

1. **Tổ chức rõ ràng** - Color và Size độc lập
2. **Dễ bảo trì** - Sửa đổi một phần không ảnh hưởng phần khác
3. **Tái sử dụng** - Code sạch, dễ mở rộng
4. **Scalable** - Dễ thêm tính năng mới
5. **Separation of Concerns** - Mỗi file có trách nhiệm riêng
