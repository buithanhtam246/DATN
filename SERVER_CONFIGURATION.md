# Server Configuration Guide

## 📊 Hệ Thống Multi-Server

Dự án sử dụng kiến trúc với 2 servers riêng biệt:

### 1. **BE Users Server** (Port 3001)
- **Mục đích**: Quản lý user, cart, orders, reviews
- **API Base**: `http://localhost:3001/api`
- **Location**: `d:\FPT\DATN\BE\Users`

**Khởi động:**
```bash
cd d:\FPT\DATN\BE\Users
npm start
# hoặc
npm run dev
```

---

### 2. **BE Admin Server** (Port 3000)
- **Mục đích**: Quản lý admin, products, vouchers, categories, brands
- **API Base**: `http://localhost:3000`
- **Location**: `d:\FPT\DATN\BE\Admin`

**Khởi động:**
```bash
cd d:\FPT\DATN\BE\Admin
npm start
# hoặc
npm run dev
```

---

### 3. **FE Angular** (Port 4200)
- **Location**: `d:\FPT\DATN\my-FE`
- **API URLs**: 
  - User API: `http://localhost:3001/api`
  - Admin API: `http://localhost:3000`

**Khởi động:**
```bash
cd d:\FPT\DATN\my-FE
npm start
# hoặc
ng serve
```

---

## 🔑 Environment Variables

### BE Users (.env)
```bash
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=DATN
JWT_SECRET=your_jwt_secret_key
```

### BE Admin (.env)
```bash
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=DATN
JWT_SECRET=your_jwt_secret_key
```

---

## 📍 Startup Sequence

**Khởi động thứ tự (quan trọng):**

1. **Start MySQL Server** (nếu chưa chạy)
   ```bash
   # Windows
   mysql.server start
   
   # hoặc qua MySQL Command Line
   mysql -u root -p
   ```

2. **Start BE Admin Server** (port 3000)
   ```bash
   cd d:\FPT\DATN\BE\Admin
   npm start
   ```

3. **Start BE Users Server** (port 3001)
   ```bash
   cd d:\FPT\DATN\BE\Users
   npm start
   ```

4. **Start FE Angular** (port 4200)
   ```bash
   cd d:\FPT\DATN\my-FE
   ng serve
   ```

5. **Access Application**
   - User App: `http://localhost:4200`
   - Admin Login: `http://localhost:4200/admin/login`
   - API Docs: 
     - User: `http://localhost:3001/api`
     - Admin: `http://localhost:3000`

---

## 🔗 API Endpoints Summary

### User APIs (Port 3001)
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/forgot-password
POST   /api/cart/create
GET    /api/cart
POST   /api/orders
GET    /api/orders
POST   /api/reviews
GET    /api/reviews
POST   /api/vouchers/apply
```

### Admin APIs (Port 3000)
```
POST   /auth/login              ← Admin login endpoint
POST   /auth/verify             ← Verify admin token
POST   /admin/products          ← Create product
GET    /admin/products          ← List products
PUT    /admin/products/:id      ← Update product
DELETE /admin/products/:id      ← Delete product
POST   /admin/orders            ← Create order
GET    /admin/orders            ← List orders
POST   /admin/vouchers          ← Create voucher
```

---

## ⚠️ Common Issues

### Issue 1: Connection Refused on Port 3000
**Solution:**
- Kiểm tra Admin server đã start chưa
- Kiểm tra port 3000 có bị dùng bởi process khác
```bash
# Windows
netstat -ano | findstr :3000

# Kill process (nếu cần)
taskkill /PID <PID> /F
```

### Issue 2: Connection Refused on Port 3001
**Solution:**
- Kiểm tra Users server đã start chưa
- Kiểm tra .env file có chỉ định PORT=3001

### Issue 3: Database Connection Error
**Solution:**
- Kiểm tra MySQL đang chạy
- Kiểm tra credentials ở .env
- Kiểm tra database DATN đã tạo

```bash
# Login MySQL
mysql -u root

# Create database
CREATE DATABASE DATN;
```

### Issue 4: CORS Error
**Solution:**
- Thêm CORS config vào server files:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
```

---

## 🔐 Admin User Setup

### Tạo Admin User qua Database
```sql
-- Login MySQL
mysql -u root -p

-- Chọn database
USE DATN;

-- Insert admin user
INSERT INTO user (name, email, password, role, created_at)
VALUES (
  'Admin User',
  'admin@example.com',
  'hashed_password_here',  -- Phải hash bằng bcryptjs
  'admin',
  NOW()
);
```

### Hoặc qua API (nếu endpoint register-admin sẵn)
```bash
curl -X POST http://localhost:3001/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "fullname": "Admin User",
    "email": "admin@example.com",
    "password": "AdminPassword123!",
    "confirmPassword": "AdminPassword123!",
    "role": "admin"
  }'
```

---

## 🚀 Production Deployment

### Recommended Setup:
```
┌─────────────────────────────────────┐
│      Load Balancer (Nginx)          │
│  (Handle SSL, routing, compression) │
└────────────────┬────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──┐    ┌───▼──┐    ┌───▼──┐
│Admin │    │Users │    │  FE  │
│3000  │    │3001  │    │4200  │
└───┬──┘    └───┬──┘    └──────┘
    │           │
    └─────┬─────┘
          │
    ┌─────▼──────┐
    │  MySQL DB  │
    │   Port 3306│
    └────────────┘
```

---

## 📝 Port Reference

| Service | Port | Purpose |
|---------|------|---------|
| MySQL | 3306 | Database |
| Admin API | 3000 | Admin endpoints |
| Users API | 3001 | User endpoints |
| Angular App | 4200 | Frontend |

---

## 🔄 Development Workflow

```bash
# Terminal 1: Start Admin Server
cd BE/Admin
npm start

# Terminal 2: Start Users Server
cd BE/Users
npm start

# Terminal 3: Start Frontend
cd my-FE
ng serve

# Verify all running:
# - http://localhost:4200 (Frontend)
# - http://localhost:3000 (Admin API)
# - http://localhost:3001/api (Users API)
```

---

## 📊 Data Flow

### User Login
```
Frontend (/login) 
    ↓
authService.login()
    ↓
POST /api/auth/login (port 3001)
    ↓
BE Users checks role (can be 'user' or 'admin')
    ↓
Returns token (7 days)
    ↓
FE stores token + role
    ↓
Route based on role:
  - 'user' → / (home)
  - 'admin' → /admin/login (choose to go to admin)
```

### Admin Login
```
Frontend (/admin/login)
    ↓
authService.adminLogin()
    ↓
POST /auth/login (port 3000 - separate!)
    ↓
BE Admin checks role = 'admin' STRICTLY
    ↓
Returns token (2 hours - shorter!)
    ↓
FE stores token + role = 'admin'
    ↓
AdminGuard allows access
    ↓
/admin/dashboard (fully protected)
```

---

## 🛠️ Troubleshooting Checklist

- [ ] MySQL running?
- [ ] .env files configured correctly?
- [ ] All 3 servers started in correct order?
- [ ] Ports 3000, 3001, 4200 available?
- [ ] Admin user exists with role='admin'?
- [ ] Browser showing correct URLs?
- [ ] Console shows no CORS errors?
- [ ] Network tab shows requests to correct ports?

---

## ✅ Verification

Test each endpoint:

```bash
# Test User API
curl http://localhost:3001/api/auth/login -X POST ...

# Test Admin API
curl http://localhost:3000/auth/login -X POST ...

# Test Frontend
curl http://localhost:4200
```

---

Enjoy your secure admin login system! 🎉
