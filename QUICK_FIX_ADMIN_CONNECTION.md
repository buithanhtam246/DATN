# 🔧 KHẮC PHỤC NGAY: Admin Server Connection Refused

## 🔴 Lỗi
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

## ✅ Giải Pháp (5 bước đơn giản)

### **Step 1: Mở PowerShell/CMD**
- Nhấn `Win + R`
- Gõ `powershell`
- Nhấn Enter

### **Step 2: Navigate tới Admin Server**
```powershell
cd d:\FPT\DATN\BE\Admin
```

### **Step 3: Cài Dependencies (nếu chưa)**
```powershell
npm install
```

### **Step 4: Start Admin Server**
```powershell
npm start
```

### **Step 5: Chờ cho đến khi thấy:**
```
✅ Đồng bộ models thành công!
🚀 Server đang chạy tại http://localhost:3000
```

---

## ✨ SAU KHI START XONG:

1. **Giữ terminal này mở** (đừng đóng!)
2. Mở terminal mới khác
3. Start Users Server:
   ```powershell
   cd d:\FPT\DATN\BE
   npm start
   ```
4. Chờ tới khi thấy:
   ```
   🚀 Server running at: http://localhost:3001
   ```
5. Mở terminal thứ 3
6. Start Frontend:
   ```powershell
   cd d:\FPT\DATN\my-FE
   ng serve
   ```

---

## 🎯 KẾT QUẢ MONG MUỐN

Khi tất cả 3 servers chạy, bạn sẽ thấy:

**Terminal 1 (Admin):**
```
✅ Đồng bộ models thành công!
🚀 Server đang chạy tại http://localhost:3000
```

**Terminal 2 (Users):**
```
🚀 Server running at: http://localhost:3001
```

**Terminal 3 (Frontend):**
```
✔ Compiled successfully.
The app is running on http://localhost:4200/
```

---

## 🌐 GIỜ RETRY LOGIN:

1. Vào: `http://localhost:4200/admin/login`
2. Nhập:
   - Email: `buithantham012021@gmail.com`
   - Password: `(mật khẩu của bạn)`
3. Click "Đăng xử lý"

---

## ⚠️ LƯU Ý QUAN TRỌNG

- **KHÔNG ĐƯỢC ĐÓNG TERMINAL** - Nếu đóng server sẽ stop
- **MỞ 3 TERMINAL RIÊNG BIỆT** - 1 cho mỗi server
- **ĐẢM BẢO CÓ 3 WINDOW/TAB TERMINAL ĐANG CHẠY**

---

## 🛠️ NẾU GẶP LỖI:

**Lỗi: "npm: command not found"**
- Cài Node.js từ: https://nodejs.org/

**Lỗi: "Cannot find module"**
```powershell
npm install
```

**Lỗi: "Port 3000 already in use"**
```powershell
# Kill process
netstat -ano | findstr :3000
taskkill /PID <số> /F
```

**Lỗi: "Cannot connect to database"**
- Start MySQL trước

---

## ✅ CHECKLIST

- [ ] Terminal 1: Admin Server chạy (port 3000)
- [ ] Terminal 2: Users Server chạy (port 3001)
- [ ] Terminal 3: Frontend chạy (port 4200)
- [ ] Vào `http://localhost:4200/admin/login`
- [ ] Login thành công → Redirect `/admin/dashboard`

---

## 💡 TẮT ĐÈN:

Admin server **PHẢI CHẠY** mới dùng được admin login!

**Thực hiện ngay bây giờ:** Mở PowerShell → Start Admin Server 🚀
