# Hướng dẫn cập nhật Backend để hỗ trợ Role

## 1. Cập nhật Database (db.json)

File `db.json` đã được cập nhật với field `role`:

```json
{
  "users": [
    {
      "id": "6752",
      "name": "duy",
      "email": "duyntps40367@gmail.com",
      "password": "444",
      "role": "user"
    },
    {
      "id": "ce11",
      "name": "duy nguyen",
      "email": "duyn7328@gmail.com",
      "password": "222",
      "role": "user"
    }
  ]
}
```

## 2. Thêm Admin Account

Thêm một tài khoản admin vào `db.json`:

```json
{
  "id": "admin1",
  "name": "Admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

## 3. Cập nhật Login Endpoint (Node.js/Express)

Cập nhật endpoint `POST /api/auth/login` để trả về role:

```javascript
// File: routes/auth.js hoặc server.js

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email và password không được để trống'
    });
  }

  // Tìm user trong db.json
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email không tồn tại'
    });
  }

  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Sai mật khẩu'
    });
  }

  // Tạo token (nếu dùng JWT)
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    'your-secret-key',
    { expiresIn: '24h' }
  );

  // Trả về response với role
  res.json({
    success: true,
    message: 'Đăng nhập thành công',
    data: {
      id: user.id,
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role  // ← QUAN TRỌNG: Trả về role
      }
    }
  });
});
```

## 4. Response Format Expected

Frontend sẽ nhận response dạng:

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "id": "admin1",
    "token": "eyJhbGc...",
    "user": {
      "id": "admin1",
      "name": "Admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

## 5. Test

### Admin Login:
- Email: `admin@example.com`
- Password: `admin123`
- Expected: Redirect to `/admin/dashboard`

### User Login:
- Email: `duyntps40367@gmail.com`
- Password: `444`
- Expected: Redirect to `/` (home page)

## Notes

- Nếu bạn dùng JSON Server (json-server package), cần middleware để handle login
- Nếu dùng Express.js thuần, hãy update endpoint như trên
- Đảm bảo role được lưu trong JWT token (nếu dùng JWT)
- Frontend sẽ lưu role vào localStorage khi login thành công
