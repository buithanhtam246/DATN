# 👤 Cách Tạo Admin User

## Vấn Đề
Khi cố đăng nhập admin, nhận lỗi: **"Email admin không tồn tại"**

## Nguyên Nhân
- Không có user với `role='admin'` trong database
- Hoặc user tồn tại nhưng role ≠ 'admin'

---

## ✅ Giải Pháp

### **Cách 1: Tạo Admin Qua MySQL Trực Tiếp** (Nhanh nhất)

#### Step 1: Hash Password Trước

Vì password phải lưu dưới dạng hash (bcrypt), bạn cần hash nó trước.

**Sử dụng Online Tool:**
1. Vào: https://bcrypt.online/
2. Nhập password: `AdminPassword123!`
3. Copy hash output

**Hoặc dùng Node.js:**
```bash
# Mở Node.js console
node

# Paste code này:
const bcrypt = require('bcryptjs');
bcrypt.hash('AdminPassword123!', 10).then(hash => console.log(hash));
// Copy output hash
```

#### Step 2: Insert Vào Database

```bash
# Login MySQL
mysql -u root -p

# Select database
USE DATN;

# Insert admin user (thay PASSWORD_HASH bằng hash từ bước 1)
INSERT INTO user (name, email, password, role, created_at)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2a$10$...',  # ← Paste hash password ở đây
  'admin',
  NOW()
);

# Verify
SELECT id, name, email, role FROM user WHERE role = 'admin';
```

**Ví dụ hoàn chỉnh:**
```sql
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

### **Cách 2: Tạo Admin Qua Script Node.js**

Tạo file `create-admin.js`:

```javascript
const { sequelize } = require('./BE/config/database');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);

    // Query create user
    await sequelize.query(
      `INSERT INTO user (name, email, password, role, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      {
        replacements: [
          'Admin User',
          'admin@example.com',
          hashedPassword,
          'admin',
          new Date()
        ]
      }
    );

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: AdminPassword123!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

createAdmin();
```

**Chạy:**
```bash
node create-admin.js
```

---

### **Cách 3: Update Existing User Thành Admin**

Nếu user thường đã tồn tại, convert thành admin:

```sql
-- Find user
SELECT id, name, email, role FROM user WHERE email = 'user@example.com';

-- Update role to admin
UPDATE user SET role = 'admin' WHERE email = 'user@example.com';

-- Verify
SELECT * FROM user WHERE email = 'user@example.com';
```

---

## 🧪 Verify Admin User

Sau khi tạo, kiểm tra:

```sql
-- Query 1: Check exist
SELECT * FROM user WHERE email = 'admin@example.com';

-- Query 2: Check role
SELECT id, name, email, role FROM user WHERE role = 'admin';

-- Expected output:
-- id | name       | email              | role
-- 1  | Admin User | admin@example.com  | admin
```

---

## 🔐 Credentials Mẫu

### Default Admin Account
```
Email: admin@example.com
Password: AdminPassword123!
Role: admin
```

**Đổi mật khẩu sau khi tạo!**

---

## 📝 SQL Script Hoàn Chỉnh

```sql
-- Login MySQL
mysql -u root -p

-- Select database
USE DATN;

-- Drop existing admin (nếu cần reset)
DELETE FROM user WHERE email = 'admin@example.com';

-- Create new admin
-- Password: AdminPassword123! (hashed)
INSERT INTO user (name, email, password, role, created_at)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2a$10$3JMmQvzV8XC8pU3kLfD1BeGXx8Q8.8Q8.8Q8.8Q8hQ8h8h8h8h8h',
  'admin',
  NOW()
);

-- Verify
SELECT id, name, email, role FROM user ORDER BY id DESC LIMIT 5;
```

---

## ✨ Kiểm Tra Login Sau Tạo

### Test 1: Test Endpoint Trực Tiếp

```bash
# Terminal
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123!"
  }'

# Expected response:
# {
#   "success": true,
#   "message": "Đăng nhập admin thành công",
#   "data": {
#     "token": "eyJhbGc...",
#     "user": { "id": 1, "name": "Admin User", "email": "admin@example.com", "role": "admin" }
#   }
# }
```

### Test 2: Test FE Login

1. Open: `http://localhost:4200/admin/login`
2. Email: `admin@example.com`
3. Password: `AdminPassword123!`
4. Click "Đăng nhập"
5. Should redirect to `/admin/dashboard`

---

## 🔑 BCrypt Hash References

| Password | Hash | Tool |
|----------|------|------|
| `AdminPassword123!` | `$2a$10$...` | bcrypt.online |
| `password123` | `$2a$10$...` | bcrypt.online |

**Generate Hash:**
- https://bcrypt.online/
- Node.js: `bcrypt.hash('password', 10)`

---

## 🆘 Troubleshooting

### "Email admin không tồn tại" - Still Appearing

**Giải pháp:**
1. Verify user tồn tại: `SELECT * FROM user WHERE email='admin@example.com';`
2. Verify role='admin': `SELECT role FROM user WHERE email='admin@example.com';`
3. Verify password hash đúng (không phải plaintext)

### "Sai mật khẩu"

**Giải pháp:**
1. Kiểm tra password nhập đúng chưa
2. Kiểm tra password trong DB có hash không
3. Thử hash mới: `bcrypt.hash('password', 10)`

### "Error: User table không tồn tại"

**Giải pháp:**
1. Database chưa migrate
2. Run migration scripts:
```bash
cd BE
npm run migrate
# hoặc
node migrate.js
```

---

## 📋 Quick Reference

| Task | Command |
|------|---------|
| Create admin | `INSERT INTO user VALUES (...)` |
| Check admin | `SELECT * FROM user WHERE role='admin'` |
| Update role | `UPDATE user SET role='admin' WHERE id=1` |
| Delete admin | `DELETE FROM user WHERE role='admin'` |
| Hash password | https://bcrypt.online/ |

---

## ✅ Checklist Sebelum Login

- [ ] Admin user created dengan role='admin'
- [ ] Password di-hash dengan bcrypt
- [ ] Admin server chạy port 3000
- [ ] Users server chạy port 3001
- [ ] FE environment correct
- [ ] JWT_SECRET sama di 2 servers
- [ ] Database connection OK

Sekarang siap login admin! 🎉
