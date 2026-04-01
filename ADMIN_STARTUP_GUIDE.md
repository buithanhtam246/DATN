# 🚀 Admin Login - Step-by-Step Startup Guide

## 🔴 Vấn đề
- Admin login page show form nhưng **click login → 404 Not Found**
- Error: `Failed to load resource: the server responded with a status of 404`
- Endpoint: `:3000/auth/login`

## ✅ Giải Pháp

### **Step 1: Cài Dependencies Cho Admin Server**

```bash
# Navigate vào Admin folder
cd d:\FPT\DATN\BE\Admin

# Cài npm packages
npm install

# Verify (should see node_modules folder)
dir node_modules
```

---

### **Step 2: Khởi Động Servers Đúng Thứ Tự**

**⚠️ QUAN TRỌNG: Mở 3 terminals riêng biệt!**

#### **Terminal 1: Start Admin Server (Port 3000)**

```bash
cd d:\FPT\DATN\BE\Admin
npm start
# hoặc
node server.js

# Expected output:
# ✅ Đồng bộ models thành công!
# 🚀 Server running at http://localhost:3000
```

**Nếu thấy lỗi:**
```
Error: Cannot find module 'express'
→ Chạy: npm install

Error: Cannot find module '../../config/database'
→ Đường dẫn sai, kiểm tra folder structure
```

---

#### **Terminal 2: Start Users Server (Port 3001)**

```bash
cd d:\FPT\DATN\BE
npm install  # Nếu chưa cài

npm start
# hoặc
node server.js

# Expected output:
# 🚀 Server running at http://localhost:3001
```

---

#### **Terminal 3: Start Frontend (Port 4200)**

```bash
cd d:\FPT\DATN\my-FE
npm install  # Nếu chưa cài

ng serve
# hoặc
npm start

# Expected output:
# ✔ Compiled successfully. The app is running on: http://localhost:4200/
```

---

### **Step 3: Verify All Servers Running**

**Check Terminal Outputs:**
```
Terminal 1 (Admin):   http://localhost:3000 ✅
Terminal 2 (Users):   http://localhost:3001 ✅
Terminal 3 (FE):      http://localhost:4200 ✅
```

**Test with curl:**
```bash
# Test Admin server
curl http://localhost:3000

# Test Users server
curl http://localhost:3001/api

# Test Frontend
curl http://localhost:4200
```

---

### **Step 4: Create Admin User (if not exists)**

```sql
-- Open MySQL
mysql -u root -p
USE DATN;

-- Check admin exists
SELECT * FROM user WHERE role='admin';

-- If no admin, insert one
INSERT INTO user (name, email, password, role, created_at)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2a$10$3JMmQvzV8XC8pU3kLfD1BeGXx8Q8.8Q8.8Q8.8Q8hQ8h8h8h8h8h',
  'admin',
  NOW()
);
```

---

### **Step 5: Test Admin Login Endpoint Directly**

```bash
# Open new terminal and run:
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123!"
  }'

# Expected response:
{
  "success": true,
  "message": "Đăng nhập admin thành công",
  "data": {
    "token": "eyJhbGc...",
    "user": { "id": 1, "email": "admin@example.com", "role": "admin" }
  }
}

# If 404: Admin server not running
# If 401: Email/password wrong
```

---

### **Step 6: Test in Browser**

1. Open: `http://localhost:4200/admin/login`
2. Enter:
   - Email: `admin@example.com`
   - Password: `AdminPassword123!`
3. Click "Đăng xử lý"
4. Should redirect to `/admin/dashboard` ✅

---

## 📋 Checklist

| Step | Command | Expected | Status |
|------|---------|----------|--------|
| 1 | `cd BE/Admin && npm install` | No errors | ☐ |
| 2 | Admin: `npm start` | Port 3000 listening | ☐ |
| 3 | Users: `npm start` | Port 3001 listening | ☐ |
| 4 | FE: `ng serve` | Port 4200 listening | ☐ |
| 5 | Create admin in DB | role='admin' | ☐ |
| 6 | curl POST /auth/login | Returns token | ☐ |
| 7 | Browser login | Redirects /admin/dashboard | ☐ |

---

## 🆘 Troubleshooting

### Error: "Cannot find module"

**Solution:**
```bash
cd d:\FPT\DATN\BE\Admin
npm install
```

### Error: "Port 3000 already in use"

**Solution:**
```bash
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Or use different port (edit .env)
# But not recommended for admin
```

### Error: "Cannot connect to database"

**Solution:**
- Start MySQL: `mysql.server start`
- Check .env has correct DB credentials
- Run migrations if needed

### Error: "404 Not Found" on /auth/login

**Solution:**
- ✅ Admin server not running → Check Terminal 1
- ✅ Route not mounted → Check BE/Admin/server.js
- ✅ Wrong port → Should be 3000
- ✅ FE environment wrong → Check environment.ts

---

## 🎯 Expected Port Configuration

```
┌─────────────────────────────────────┐
│     PORT ALLOCATION                  │
├─────────────────────────────────────┤
│ MySQL           : 3306              │
│ Admin Server    : 3000  ✅          │
│ Users Server    : 3001  ✅          │
│ Frontend        : 4200  ✅          │
└─────────────────────────────────────┘
```

---

## 💡 Quick Start (Copy-Paste)

```bash
# Terminal 1 - Admin Server
cd d:\FPT\DATN\BE\Admin
npm install
npm start

# Terminal 2 - Users Server  
cd d:\FPT\DATN\BE
npm install
npm start

# Terminal 3 - Frontend
cd d:\FPT\DATN\my-FE
npm install
ng serve
```

Then open: `http://localhost:4200/admin/login`

---

## ✨ Success Indicators

1. **Terminal 1:** Shows "Server running at http://localhost:3000"
2. **Terminal 2:** Shows "Server running at http://localhost:3001"
3. **Terminal 3:** Shows "Compiled successfully" + port 4200
4. **Browser:** Can access http://localhost:4200/admin/login
5. **Login:** Works with admin credentials

---

## 📞 If Still Not Working

1. **Check all 3 terminals are running**
   - If any shows error → Fix it first

2. **Check environment.ts**
   ```typescript
   apiUrl: 'http://localhost:3001/api'
   adminApiUrl: 'http://localhost:3000'
   ```

3. **Check admin user exists**
   ```sql
   SELECT * FROM user WHERE email='admin@example.com' AND role='admin';
   ```

4. **Check JWT_SECRET same**
   - `BE/.env` and `BE/Admin/.env` must match

5. **Clear browser cache**
   - Ctrl+Shift+Delete → Clear All

6. **Check browser console (F12)**
   - Look for detailed error messages

---

Giờ thực hiện đúng các bước trên sẽ login được! 🎉
