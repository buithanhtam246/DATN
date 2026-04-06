# 🔐 Hướng Dẫn Chức Năng Đăng Ký

## ✅ Những Gì Đã Được Cập Nhật

### Frontend (Angular)
- ✅ **RegisterComponent** (`register.component.ts`):
  - Sử dụng `AuthService` để gọi API `/api/auth/register`
  - Validation: kiểm tra field rỗng, password khớp, độ dài password
  - Error handling: hiển thị lỗi từ API
  - Loading state: disable button khi đang xử lý

- ✅ **Template HTML** (`register.component.html`):
  - Thêm field `confirmPassword` (bắt buộc)
  - Hiển thị error message
  - Button loading state
  - Link "Đăng nhập tại đây" tới trang login

- ✅ **Styling** (`register.component.scss`):
  - Style error message (màu đỏ)
  - Disable state cho input/button
  - Login link styling

### Backend (Node.js)
- ✅ API endpoint: `POST /api/auth/register`
- ✅ Controller xử lý đăng ký
- ✅ Service xác thực dữ liệu
- ✅ Database lưu user mới

---

## 🚀 Chạy Ứng Dụng

### Terminal 1: Backend
```bash
cd d:\FPT\DATN\BE
npm start
# Server: http://localhost:3000
```

### Terminal 2: Frontend
```bash
cd d:\FPT\DATN\my-FE
npm start
# Frontend: http://localhost:56130 (hoặc port khác nếu 4200 đang dùng)
```

---

## 🧪 Test Đăng Ký

### Cách 1: Test Qua Giao Diện (Khuyến Khích)

1. **Mở browser**: Truy cập `http://localhost:56130` (hoặc port frontend)
2. **Tìm trang đăng ký**: Click "Đăng ký" hoặc truy cập `/register`
3. **Nhập thông tin**:
   - Tên người dùng: `Nguyễn Văn A`
   - Email: `test@example.com`
   - Mật khẩu: `Password123`
   - Nhập lại mật khẩu: `Password123`
4. **Click "Đăng Kí"**
5. **Kiểm tra kết quả**:
   - ✅ Thành công: Alert "Đăng ký thành công!", chuyển sang trang login
   - ❌ Lỗi: Hiển thị error message đỏ

### Cách 2: Test Bằng Postman

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "fullname": "Nguyễn Văn A",
  "email": "test@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

**Response Thành Công (201)**:
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "id": 1,
    "fullname": "Nguyễn Văn A",
    "email": "test@example.com",
    "createdAt": "2026-03-11T12:00:00.000Z"
  }
}
```

**Response Lỗi (400)**:
```json
{
  "success": false,
  "message": "Email đã tồn tại"
}
```

---

## 🔍 Các Validation Được Kiểm Tra

| Validation | Lỗi | Giải Pháp |
|-----------|-----|----------|
| Field rỗng | "Vui lòng nhập đầy đủ thông tin" | Nhập đủ tất cả field |
| Password ≠ Confirm | "Mật khẩu không khớp" | Nhập lại confirm password |
| Password < 6 ký tự | "Mật khẩu phải có ít nhất 6 ký tự" | Dùng password dài hơn |
| Email tồn tại | "Email đã tồn tại" | Dùng email khác |
| Server error | Error từ backend | Kiểm tra console backend |

---

## 📊 Flow Đăng Ký Hoàn Chỉnh

```
┌─────────────────────┐
│   Nhập Thông Tin    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Validation (FE)    │ ← Kiểm tra client-side
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Gửi Tới Backend    │
│ POST /api/auth/...  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Validation (BE)     │ ← Kiểm tra server-side
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Hash Password       │ ← Mã hóa mật khẩu
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Lưu Vào Database    │ ← INSERT users
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Trả Response        │ ← 201 Success
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Alert Thành Công    │ ← Hiển thị thông báo
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Chuyển Sang Login   │ ← router.navigate
└─────────────────────┘
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot POST /api/auth/register"
- **Nguyên nhân**: Backend không có route đăng ký
- **Giải pháp**: Kiểm tra `auth.router.js` có endpoint POST `/register` không

### Lỗi: "Email đã tồn tại"
- **Nguyên nhân**: Email này đã được đăng ký trước đó
- **Giải pháp**: Dùng email mới hoặc xóa user cũ từ database

### Lỗi: CORS Error
- **Nguyên nhân**: Backend chưa cấu hình CORS
- **Giải pháp**: Kiểm tra `server.js` có `cors()` middleware không

### Không thấy thay đổi sau reload
- **Nguyên nhân**: Frontend cache
- **Giải pháp**: Clear cache (Ctrl+Shift+Delete) hoặc Ctrl+F5

---

## 📝 File Liên Quan

```
my-FE/
├── src/app/pages/register/
│   ├── register.component.ts ✅ (Logic đăng ký)
│   ├── register.component.html ✅ (Form)
│   └── register.component.scss ✅ (Styling)
├── src/app/services/
│   ├── auth.service.ts ✅ (Gọi API)
│   └── api.service.ts ✅ (HTTP client)

BE/
├── Users/
│   ├── controller/auth.controller.js ✅ (Xử lý HTTP)
│   ├── service/auth.service.js ✅ (Business logic)
│   ├── router/auth.router.js ✅ (Routes)
│   └── model/user.model.js ✅ (Database schema)
```

---

## ✨ Tiếp Theo

1. ✅ **Đăng ký** (hoàn thành)
2. 🔲 **Đăng nhập** - Cải thiện login component
3. 🔲 **Quên mật khẩu** - Thêm flow reset password
4. 🔲 **Xác thực email** - OTP/Email verification
5. 🔲 **Dashboard** - Trang chủ sau login

---

**Mọi câu hỏi hay lỗi, hãy cho biết!** 🚀
