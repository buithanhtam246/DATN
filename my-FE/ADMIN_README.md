# Admin Panel - GoodShoes

Giao diện quản trị hiện đại được xây dựng bằng Angular 20.

## 🎯 Tính năng

### 1. Dashboard
- Tổng quan thống kê doanh thu, đơn hàng, người dùng, sản phẩm
- Biểu đồ doanh thu theo tháng
- Danh sách sản phẩm bán chạy nhất
- Đơn hàng gần đây

### 2. Quản lý sản phẩm
- Danh sách sản phẩm với tìm kiếm và lọc
- Thêm/sửa/xóa sản phẩm
- Quản lý tồn kho
- Bật/tắt trạng thái sản phẩm

### 3. Quản lý đơn hàng
- Theo dõi đơn hàng theo trạng thái
- Cập nhật trạng thái đơn hàng
- Xem chi tiết đơn hàng
- Thống kê đơn hàng

### 4. Quản lý người dùng
- Danh sách người dùng
- Phân quyền (Admin/Customer)
- Khóa/mở khóa tài khoản
- Theo dõi lịch sử mua hàng

### 5. Quản lý thương hiệu
- Quản lý các thương hiệu sản phẩm
- Thêm/sửa/xóa thương hiệu
- Hiển thị logo thương hiệu
- Bật/tắt trạng thái

### 6. Quản lý đánh giá
- Kiểm duyệt đánh giá sản phẩm
- Duyệt/từ chối đánh giá
- Lọc theo đánh giá sao
- Xóa đánh giá vi phạm

### 7. Quản lý voucher
- Tạo mã giảm giá
- Quản lý voucher (phần trăm/cố định)
- Giới hạn sử dụng
- Theo dõi tình trạng sử dụng

## 🚀 Truy cập

Truy cập admin panel tại: `http://localhost:4200/admin`

Các route admin:
- `/admin` hoặc `/admin/dashboard` - Dashboard
- `/admin/products` - Quản lý sản phẩm
- `/admin/orders` - Quản lý đơn hàng
- `/admin/users` - Quản lý người dùng
- `/admin/brands` - Quản lý thương hiệu
- `/admin/reviews` - Quản lý đánh giá
- `/admin/vouchers` - Quản lý voucher

## 🎨 Giao diện

- **Thiết kế hiện đại**: Sử dụng màu sắc và typography chuyên nghiệp
- **Responsive**: Tương thích với nhiều kích thước màn hình
- **Dark sidebar**: Thanh điều hướng bên trái với gradient đẹp mắt
- **Smooth animations**: Hiệu ứng chuyển động mượt mà
- **Icons**: Sử dụng emoji icons để dễ nhận diện

## 📁 Cấu trúc thư mục

```
src/app/admin/
├── admin.routes.ts          # Routing configuration
├── layouts/
│   └── admin-layout/        # Admin layout với sidebar
│       ├── admin-layout.component.ts
│       ├── admin-layout.component.html
│       └── admin-layout.component.scss
└── pages/
    ├── dashboard/           # Trang dashboard
    ├── products/            # Quản lý sản phẩm
    ├── orders/              # Quản lý đơn hàng
    ├── users/               # Quản lý người dùng
    ├── brands/              # Quản lý thương hiệu
    ├── reviews/             # Quản lý đánh giá
    └── vouchers/            # Quản lý voucher
```

## 🛠 Công nghệ

- **Angular 20**: Framework chính
- **Standalone Components**: Không cần NgModule
- **Zoneless Change Detection**: Hiệu suất cao hơn
- **Signal API**: Quản lý state hiện đại
- **SCSS**: Style preprocessing
- **Lazy Loading**: Tải components khi cần thiết

## 📝 Lưu ý

- Tất cả components đều sử dụng standalone architecture
- Data hiện tại là mock data, cần tích hợp với backend API
- Các chức năng CRUD đang hoạt động với local data
- Responsive design được tối ưu cho desktop (mobile có thể cần điều chỉnh thêm)

## 🔄 Tích hợp Backend

Để tích hợp với backend, cần:

1. Tạo services trong `src/app/admin/services/`:
   - `product.service.ts`
   - `order.service.ts`
   - `user.service.ts`
   - `brand.service.ts`
   - `review.service.ts`
   - `voucher.service.ts`

2. Inject HttpClient và gọi API endpoints
3. Thay thế mock data bằng dữ liệu từ API
4. Xử lý authentication/authorization
5. Thêm loading states và error handling

## 🎯 Tính năng tiếp theo

- [ ] Authentication & Authorization
- [ ] Upload hình ảnh
- [ ] Excel export/import
- [ ] Real-time notifications
- [ ] Advanced charts (Chart.js/ApexCharts)
- [ ] Dark mode toggle
- [ ] Multiple language support
- [ ] Activity logs
- [ ] Analytics & Reports
