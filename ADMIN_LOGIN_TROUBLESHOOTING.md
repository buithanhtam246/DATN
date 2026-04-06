# 🔧 Admin Login Troubleshooting Guide

## 🚨 Vấn Đề: Admin Login Không Hoạt Động

### Triệu Chứng
- ❌ Nhập email/password admin → "Email admin không tồn tại" hoặc "Sai mật khẩu"
- ❌ Dù email/password đúng vẫn báo lỗi
- ❌ Không thể đăng nhập vào `/admin/login`

---

## ✅ Giải Pháp Từng Bước

### **Step 1: Kiểm Tra Ports Đang Chạy**

```bash
# Terminal 1: Kiểm tra port nào đang dùng
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Nên thấy:
# Port 3000: Admin Server
# Port 3001: Users Server
```

### **Step 2: Khởi Động Servers Đúng Thứ Tự**

```bash
# Terminal 1: Start Admin Server (Port 3000)
cd d:\FPT\DATN\BE\Admin
npm start

# Terminal 2: Start Users Server (Port 3001)
cd d:\FPT\DATN\BE
npm start

# Terminal 3: Start Frontend (Port 4200)
cd d:\FPT\DATN\my-FE
ng serve
```

**⚠️ QUAN TRỌNG:** 
- Users server phải chạy ở **port 3001** (đã sửa .env)
- Admin server phải chạy ở **port 3000**
- Nếu chạy sai port → Admin login sẽ fail

---

### **Step 3: Kiểm Tra Environment Configuration**

**File:** `my-FE/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',      // ← Users server
  adminApiUrl: 'http://localhost:3000'      // ← Admin server
};
```

✅ Phải đúng như trên!

---

### **Step 4: Kiểm Tra Admin User Trong Database**

Admin account phải:
1. **Tồn tại** trong table `user`
2. **Có role='admin'** (không phải 'user')
3. **Mật khẩu đúng** (được hash bằng bcrypt)

#### **Cách 1: Query Database Trực Tiếp**

```sql
-- Login MySQL
mysql -u root -p
USE DATN;

-- Kiểm tra admin users
SELECT id, name, email, role FROM user WHERE role = 'admin';

-- Nếu không có, tạo admin mới
INSERT INTO user (name, email, password, role, created_at)
VALUES (
  'Admin User',
  'admin@example.com',
  'hashed_password_here',  -- ⚠️ Phải hash!
  'admin',
  NOW()
);
```

#### **Cách 2: Tạo Admin Qua API (Nếu Endpoint Có)**

```bash
# Nếu endpoint /api/auth/register-admin tồn tại
curl -X POST http://localhost:3001/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <existing_admin_token>" \
  -d '{
    "fullname": "Admin User",
    "email": "admin@example.com",
    "password": "AdminPassword123!",
    "confirmPassword": "AdminPassword123!",
    "role": "admin"
  }'
```

---

### **Step 5: Kiểm Tra JWT Secret Giống Nhau**

Admin server và Users server phải dùng **cùng một JWT_SECRET**!

**File 1:** `BE/.env`
```bash
JWT_SECRET=your_jwt_secret_key
```

**File 2:** `BE/Admin/.env`
```bash
JWT_SECRET='your_jwt_secret_key'
```

⚠️ **Phải GIỐNG nhau!** Nếu khác → Token không verify được

---

### **Step 6: Test Admin Login Endpoint Trực Tiếp**

```bash
# Test endpoint /auth/login trên port 3000
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123!"
  }'

# Nếu thành công, sẽ thấy:
{
  "success": true,
  "message": "Đăng nhập admin thành công",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}

# Nếu lỗi:
{
  "success": false,
  "message": "Email admin không tồn tại hoặc không có quyền admin"
  // hoặc
  "message": "Sai mật khẩu"
}
```

---

## 🔍 Debugging Checklist

| Item | Status | Fix |
|------|--------|-----|
| Admin server chạy port 3000? | ☐ | `BE/Admin/.env`: PORT=3000 |
| Users server chạy port 3001? | ☐ | `BE/.env`: PORT=3001 |
| FE environment đúng? | ☐ | `src/environments/environment.ts` |
| Admin user tồn tại? | ☐ | Query DB hoặc tạo mới |
| Admin user có role='admin'? | ☐ | Kiểm tra DB |
| JWT_SECRET giống? | ☐ | So sánh `BE/.env` vs `BE/Admin/.env` |
| Mật khẩu admin đúng? | ☐ | Thử endpoint `/auth/login` |
| Database kết nối OK? | ☐ | Check MySQL running |

---

## 🛠️ Common Errors & Solutions

### Error 1: "Email admin không tồn tại"

**Nguyên nhân:**
- Admin user không tồn tại trong DB
- Admin user có role ≠ 'admin'
- Email sai

**Giải pháp:**
```sql
-- Kiểm tra
SELECT * FROM user WHERE email = 'admin@example.com' AND role = 'admin';

-- Nếu không có, tạo (hash password trước)
-- Sử dụng bcryptjs để hash
```

### Error 2: "Sai mật khẩu"

**Nguyên nhân:**
- Password nhập sai
- Password trong DB không hash đúng

**Giải pháp:**
- Kiểm tra password nhập có đúng không
- Nếu DB password không hash, cần update (dùng bcryptjs)

### Error 3: Endpoint /auth/login không respond

**Nguyên nhân:**
- Admin server không chạy
- Port 3000 bị dùng bởi process khác
- CORS error

**Giải pháp:**
```bash
# Kiểm tra port 3000
netstat -ano | findstr :3000

# Kill process nếu needed
taskkill /PID <pid> /F

# Restart Admin server
cd BE/Admin
npm start
```

### Error 4: FE báo "localhost:3000 refused"

**Nguyên nhân:**
- Admin server không chạy
- Port sai

**Giải pháp:**
- Kiểm tra Terminal 1 (Admin server) có chạy không
- Check port: `netstat -ano | findstr :3000`

### Error 5: "Network timeout"

**Nguyên nhân:**
- Servers không chạy
- Firewall block
- CORS error

**Giải pháp:**
```bash
# Test endpoint trực tiếp
curl http://localhost:3000/auth/login -X POST

# Nếu timeout → Server không running
```

---

## 🎯 Port Configuration Summary

| Service | Port | .env File | Status |
|---------|------|-----------|--------|
| Admin Server | 3000 | `BE/Admin/.env` | PORT=3000 ✅ |
| Users Server | 3001 | `BE/.env` | PORT=3001 ✅ (fixed) |
| Frontend | 4200 | Auto (Angular) | ✅ |
| MySQL | 3306 | Default | ✅ |

---

## 📋 Environment Files

### BE/.env (Users Server)
```env
PORT=3001
JWT_SECRET=your_jwt_secret_key
DB_NAME=DATN
```

### BE/Admin/.env (Admin Server)
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key
DB_NAME=DATN
```

### my-FE/src/environments/environment.ts
```typescript
apiUrl: 'http://localhost:3001/api'
adminApiUrl: 'http://localhost:3000'
```

---

## ✨ Verification Steps

### 1. Check All Servers Running

```bash
# Terminal output should show:
# Terminal 1: Admin Server running at http://localhost:3000
# Terminal 2: Users Server running at http://localhost:3001
# Terminal 3: Angular app compiled successfully (port 4200)
```

### 2. Test Endpoints

```bash
# User API
curl http://localhost:3001/api

# Admin API
curl http://localhost:3000

# Frontend
curl http://localhost:4200
```

### 3. Test Admin Login

```bash
# POST to admin endpoint
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPassword123!"}'

# Expected response:
# { "success": true, "data": { "token": "...", "user": {...} } }
```

### 4. Test FE Admin Login

1. Open `http://localhost:4200/admin/login`
2. Enter admin email & password
3. Should redirect to `/admin/dashboard`

---

## 🆘 If Still Not Working

1. **Restart all servers**
   ```bash
   # Ctrl+C để stop tất cả
   # Sau đó start lại theo đúng thứ tự
   ```

2. **Clear browser cache**
   ```
   Ctrl+Shift+Delete → Clear All
   ```

3. **Check browser console**
   ```
   F12 → Console tab → Check for errors
   ```

4. **Check Network tab**
   ```
   F12 → Network tab → Try login → See if request goes to localhost:3000
   ```

5. **Check server logs**
   ```
   Terminal 1 (Admin): Should see POST /auth/login
   Terminal 2 (Users): Should see POST /api/auth/login
   ```

---

## 📞 Support

If still having issues:
1. Verify ALL 3 servers running (port 3000, 3001, 4200)
2. Verify admin user exists with role='admin'
3. Verify JWT_SECRET same on both backends
4. Test endpoint directly with curl
5. Check browser Network tab for errors

Giờ admin login nên hoạt động! 🎉
