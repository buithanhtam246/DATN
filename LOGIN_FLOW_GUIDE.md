# 🔐 Login Flow - User vs Admin

## Vấn đề
Khi user đăng nhập từ form `/login` với tài khoản có role='admin', nó sẽ tự động nhảy vào trang admin thay vì chỉ cho phép tài khoản user bình thường đăng nhập.

## Giải pháp
Tách biệt hoàn toàn 2 flow đăng nhập:

### 1️⃣ **User Login** (/login)
- **Endpoint**: `POST /api/auth/login` (port 3001)
- **Cho phép**: Tất cả role ('user', 'admin')
- **Redirect Logic**:
  - Nếu role = 'user' → Redirect `/` (home)
  - Nếu role = 'admin' → **Xóa token + hiển thị lỗi + redirect `/admin/login`**

### 2️⃣ **Admin Login** (/admin/login)
- **Endpoint**: `POST /auth/login` (port 3000 - riêng biệt)
- **Cho phép**: Chỉ role = 'admin'
- **Redirect Logic**:
  - Nếu role = 'admin' → Redirect `/admin/dashboard`
  - Nếu role ≠ 'admin' → Hiển thị lỗi

---

## 📊 Flow Chart

```
┌─────────────────────────────────────────────────────────────┐
│                   User Login (/login)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User nhập email + password                             │
│  2. POST /api/auth/login (port 3001)                       │
│  3. Backend kiểm tra: email + password                     │
│     ✓ Trả về token + user (ANY ROLE)                      │
│                                                              │
│  4. FE kiểm tra role:                                      │
│     ├─ Nếu role='user'                                    │
│     │  ✓ Lưu token + userRole='user'                     │
│     │  ✓ Redirect → / (home)                              │
│     │                                                       │
│     └─ Nếu role='admin'                                   │
│        ✗ Xóa localStorage (clear token)                   │
│        ✗ Hiển thị lỗi: "Tài khoản admin phải sử dụng      │
│        │                /admin/login để đăng nhập!"       │
│        ✗ Redirect → /admin/login                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Admin Login (/admin/login)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Admin nhập email + password                            │
│  2. POST /auth/login (port 3000) ← ENDPOINT RIÊNG BIỆT   │
│  3. Backend kiểm tra:                                      │
│     ├─ email + password                                   │
│     └─ role = 'admin' (STRICT CHECK)                      │
│        ✓ Trả về token (2 giờ expiration)                 │
│        ✗ Nếu role ≠ 'admin' → Lỗi 401                   │
│                                                              │
│  4. FE lưu token:                                          │
│     ✓ localStorage.setItem('authToken', token)            │
│     ✓ localStorage.setItem('userRole', 'admin')           │
│     ✓ Redirect → /admin/dashboard                         │
│                                                              │
│  5. AdminGuard bảo vệ:                                     │
│     ✓ Kiểm tra token có hợp lệ                            │
│     ✓ Kiểm tra role = 'admin'                             │
│     ✗ Nếu không → Redirect /admin/login                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Frontend Implementation

### Login Component (`/login`)

```typescript
login() {
  this.authService.login(email, password).subscribe({
    next: (response) => {
      const userData = response.data.user;
      
      if (userData.role === 'admin') {
        // ❌ Admin không được phép login từ /login
        localStorage.clear();
        this.notificationService.showError(
          "Tài khoản admin phải sử dụng /admin/login để đăng nhập!"
        );
        this.router.navigate(['/admin/login']);
      } else if (userData.role === 'user') {
        // ✅ User bình thường
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', 'user');
        this.router.navigate(['/']);
      }
    }
  });
}
```

### Admin Login Component (`/admin/login`)

```typescript
login() {
  this.authService.adminLogin(email, password).subscribe({
    next: (response) => {
      const userData = response.data.user;
      
      // Chỉ admin mới tới được đây (backend đã kiểm tra)
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', 'admin');
      this.router.navigate(['/admin/dashboard']);
    }
  });
}
```

---

## 🛡️ Backend Protection

### BE Users Login
```javascript
// POST /api/auth/login
async login(req, res) {
  const { email, password } = req.body;
  
  const user = await findByEmail(email);
  const isMatch = await compare(password, user.password);
  
  // Trả về token cho ANY role
  const token = generateToken(user);
  
  return {
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        role: user.role  // ← FE sẽ kiểm tra
      }
    }
  };
}
```

### BE Admin Login
```javascript
// POST /auth/login (RIÊNG BIỆT)
async login(req, res) {
  const { email, password } = req.body;
  
  // ✅ STRICT: Chỉ SELECT user với role='admin'
  const user = await sequelize.query(
    `SELECT * FROM user WHERE email=? AND role='admin'`
  );
  
  if (!user) {
    return res.status(401).json({
      message: "Email admin không tồn tại"
    });
  }
  
  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      message: "Sai mật khẩu"
    });
  }
  
  // Token 2 giờ (ngắn hơn)
  const token = generateToken(user, '2h');
  
  return {
    success: true,
    data: {
      token,
      user: { id: user.id, role: 'admin' }
    }
  };
}
```

---

## ✅ Test Cases

### Test 1: User Login (role='user')
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response: ✓ token + user (role='user')
Frontend: ✓ Redirect / (home)
```

### Test 2: Admin tries /login endpoint (role='admin')
```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "AdminPassword123!"
}

Response: ✓ token + user (role='admin')
Frontend: ❌ Xóa token + Redirect /admin/login với lỗi
Result: ✓ Admin bị ngăn, phải dùng /admin/login
```

### Test 3: Admin Login (riêng biệt)
```bash
POST /auth/login (port 3000)
{
  "email": "admin@example.com",
  "password": "AdminPassword123!"
}

Response: ✓ token (2h expiration) + user (role='admin')
Frontend: ✓ Redirect /admin/dashboard
AdminGuard: ✓ Cho phép access
Result: ✓ Admin login thành công
```

### Test 4: User tries /admin/login
```bash
POST /auth/login (port 3000)
{
  "email": "user@example.com",
  "password": "password123"
}

Response: ❌ 401 "Email admin không tồn tại"
Result: ❌ Không được phép (backend strict check)
```

---

## 📋 Changes Made

### FE Changes
1. **login.component.ts**
   - Admin attempting /login → clear token + error + redirect /admin/login
   - User login → redirect home

2. **login.component.html**
   - Thêm notice cho admin hướng dẫn dùng /admin/login

3. **admin-login.component.ts**
   - Sử dụng `adminLogin()` endpoint
   - Nếu thành công → /admin/dashboard

### BE Changes
1. **admin-auth.controller.js**
   - `POST /auth/login` chỉ cho role='admin'
   - Query với WHERE role='admin'

2. **admin-auth.middleware.js**
   - Rate limiting: 5 lần/15 phút

---

## 🔑 Key Points

1. **Endpoint khác nhau**
   - User: `POST /api/auth/login` (port 3001)
   - Admin: `POST /auth/login` (port 3000)

2. **Backend strictness**
   - Admin endpoint: WHERE role='admin' (MANDATORY)
   - User endpoint: Cho phép ANY role (nhưng FE kiểm tra)

3. **Frontend protection**
   - /login: Nếu role='admin' → Reject + Redirect /admin/login
   - /admin/login: Nếu role≠'admin' → Reject (backend)

4. **Token expiration**
   - User: 7 days
   - Admin: 2 hours (bảo mật cao)

5. **Route protection**
   - AdminGuard: Kiểm tra isAdmin() = (role='admin' AND token valid)
   - Chỉ cho admin access /admin/*

---

## 🎯 Summary

| Tính Năng | /login | /admin/login |
|-----------|--------|-------------|
| **Endpoint** | /api/auth/login | /auth/login |
| **Port** | 3001 | 3000 |
| **Cho phép Role** | user, admin | admin only |
| **Backend Check** | email + password | email + password + role='admin' |
| **FE Check** | Nếu admin → reject | - |
| **Redirect** | user→/, admin→/admin/login | admin→/admin/dashboard |
| **Token Duration** | 7 days | 2 hours |
| **Rate Limit** | - | 5/15min |

Giờ admin không thể vô tình login từ /login nữa! 🎉
