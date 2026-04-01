# 🔐 Admin Login - Cổng Quản Trị Riêng Biệt

## Tổng Quan

Hệ thống đã được tách biệt thành 2 cổng riêng biệt để tăng cường bảo mật:

### 1. **Cổng User (Port 3001 hoặc 3000/api)**
- Endpoint: `POST /api/auth/login`
- Dùng cho: Người dùng bình thường
- Token hết hạn: 7 ngày (tuỳ chỉnh)

### 2. **Cổng Admin (Port 3000)**
- Endpoint: `POST /auth/login`
- Dùng cho: Quản trị viên (role = 'admin')
- Token hết hạn: 2 giờ (ngắn hơn cho bảo mật cao)
- Bảo vệ: Rate limiting (tối đa 5 lần/15 phút)

---

## 🏗️ Kiến Trúc Backend

### BE Users (port 3001 - tuỳ chỉnh)
```
/api/auth/login - Login cho user bình thường
```

### BE Admin (port 3000)
```
/auth/login - Login cho admin (endpoint riêng biệt)
/auth/verify - Xác nhận token admin
/admin/* - Các endpoint quản lý khác
```

---

## 🔧 Cấu Hình Frontend

### Environment Development
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',           // User API
  adminApiUrl: 'http://localhost:3000'           // Admin API
};
```

### Environment Production
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',      // User API
  adminApiUrl: 'https://admin.yourdomain.com'    // Admin API riêng
};
```

---

## 📝 API Service Methods

### User Login
```typescript
login(data: any): Observable<any>
// Endpoint: /api/auth/login
// Response: { token, user: { id, name, email, role } }
```

### Admin Login
```typescript
adminLogin(data: any): Observable<any>
// Endpoint: /auth/login (trên Admin server)
// Response: { token, user: { id, name, email, role } }
```

### Admin Verify Token
```typescript
adminVerifyToken(): Observable<any>
// Endpoint: /auth/verify (trên Admin server)
// Yêu cầu: Authorization header với token
```

---

## 🚀 Sử Dụng

### User Login
```typescript
this.authService.login('user@example.com', 'password').subscribe(response => {
  // User login thường
  localStorage.setItem('authToken', response.data.token);
});
```

### Admin Login
```typescript
this.authService.adminLogin('admin@example.com', 'password').subscribe(response => {
  // Admin login riêng biệt
  localStorage.setItem('authToken', response.data.token);
  localStorage.setItem('userRole', 'admin');
});
```

---

## 🔒 Tính Năng Bảo Mật

### 1. **Rate Limiting**
- **Giới hạn**: 5 lần đăng nhập thất bại
- **Thời gian**: 15 phút
- **Khóa**: Dựa trên email + IP address
- **Phản hồi**: 429 Too Many Requests

### 2. **Token Expiration**
- **User Token**: 7 ngày
- **Admin Token**: 2 giờ (ngắn hơn)

### 3. **Role Check**
- Endpoint `/auth/login` chỉ chấp nhận user có `role = 'admin'`
- Middleware `adminAuthMiddleware` kiểm tra role trong JWT

### 4. **Admin Login Logs** (Optional)
- Lưu lại mỗi lần admin login
- Lưu: admin_id, email, IP address, timestamp
- Table: `admin_login_logs` (tạo tùy chọn)

---

## ⚙️ Backend Implementation

### Admin Auth Controller
```javascript
// POST /auth/login
async login(req, res) {
  const { email, password } = req.body;
  
  // Chỉ cho login với role = 'admin'
  const user = await sequelize.query(
    `SELECT * FROM user WHERE email = ? AND role = 'admin'`
  );
  
  // Verify password & generate token (2h expiration)
  const token = jwtUtil.generateToken(user, '2h');
}
```

### Admin Auth Middleware
```javascript
// Kiểm tra role = 'admin'
const adminAuthMiddleware = (req, res, next) => {
  const decoded = jwtUtil.verifyToken(token);
  if (decoded.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin mới có thể truy cập' });
  }
};

// Rate limiting
const adminLoginRateLimiter = (req, res, next) => {
  // 5 lần/15 phút per email+IP
};
```

---

## 📋 Routes Comparison

### User Routes (BE Users)
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/forgot-password
```

### Admin Routes (BE Admin)
```
POST /auth/login - Admin login riêng
POST /auth/verify - Verify token admin
POST /admin/products - Manage products
POST /admin/orders - Manage orders
POST /admin/vouchers - Manage vouchers
POST /admin/users - Manage users
```

---

## 🔄 Flow Chart

```
User Login Flow:
1. User click "Login" (/login page)
2. POST http://localhost:3001/api/auth/login
3. Verify email & password
4. Return token + user data
5. Save to localStorage
6. Redirect to "/"

Admin Login Flow:
1. Admin click "Admin Login" (/admin/login page)
2. POST http://localhost:3000/auth/login (riêng biệt!)
3. Check: role = 'admin' (bảo vệ)
4. Rate limit: max 5 attempts/15 min
5. Return token (2h expiration)
6. Save to localStorage
7. Redirect to "/admin/dashboard"
8. AdminGuard protects all /admin/* routes
```

---

## ✅ Verification Commands

### Test User Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Test Admin Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123!"
  }'
```

### Test Admin Verify
```bash
curl -X POST http://localhost:3000/auth/verify \
  -H "Authorization: Bearer <token>"
```

---

## ⚠️ Important Notes

1. **Đảm bảo Admin Server chạy trên port 3000**
2. **Đảm bảo User Server chạy trên port 3001** (hoặc port khác)
3. **Cập nhật environment variables cho production**
4. **Admin login logs table là optional** (comment out nếu chưa tạo)
5. **Rate limiting dùng in-memory** - cần upgrade cho production (use Redis)

---

## 🛡️ Production Recommendations

1. **HTTPS only** - Tất cả endpoints phải dùng HTTPS
2. **CORS carefully** - Chỉ cho phép origins đúng
3. **Rate limiting** - Upgrade to Redis (in-memory không tốt cho production)
4. **Admin login logs** - Tạo database table để lưu logs
5. **IP whitelisting** - Giới hạn IP có thể access admin server
6. **Two-factor authentication** - Thêm 2FA cho admin login
7. **VPN/Firewall** - Đặt admin server sau firewall

---

## 📞 Support

Nếu có vấn đề với admin login, kiểm tra:
- Admin server đang chạy trên port 3000
- Database có tài khoản admin (role = 'admin')
- Environment variable `adminApiUrl` đúng
- JWT secret key giống trên cả 2 servers
