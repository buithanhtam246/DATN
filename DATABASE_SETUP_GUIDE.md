# 🛠️ Database Setup Hướng Dẫn - Gender-Based Size Management

## 1. Cập nhật Size Table với Gender Field

### Cách 1: Sử dụng MySQL Command Line

```bash
mysql -u root -p DATN_DB < d:\FPT\DATN\BE\Admin\migrations\add_gender_to_size.sql
```

### Cách 2: Sử dụng MySQL Workbench hoặc Phpmyadmin

Chạy SQL queries sau:

```sql
-- 1. Thêm gender column vào size table (nếu chưa có)
ALTER TABLE `size` ADD COLUMN `gender` ENUM('male', 'female') DEFAULT 'male' AFTER `size`;

-- 2. Tạo lại size table với schema hoàn chỉnh (tuỳ chọn - xóa dữ liệu cũ)
DROP TABLE IF EXISTS `size`;

CREATE TABLE `size` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `size` INT NOT NULL,
  `gender` ENUM('male', 'female') NOT NULL DEFAULT 'male',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_size_gender` (`size`, `gender`),
  INDEX `idx_gender` (`gender`),
  INDEX `idx_size` (`size`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Thêm dữ liệu mẫu (tuỳ chọn)
INSERT INTO `size` (`size`, `gender`) VALUES 
-- Size Nam (35-45)
(35, 'male'),
(36, 'male'),
(37, 'male'),
(38, 'male'),
(39, 'male'),
(40, 'male'),
(41, 'male'),
(42, 'male'),
(43, 'male'),
(44, 'male'),
(45, 'male'),
-- Size Nữ (34-43)
(34, 'female'),
(35, 'female'),
(36, 'female'),
(37, 'female'),
(38, 'female'),
(39, 'female'),
(40, 'female'),
(41, 'female'),
(42, 'female'),
(43, 'female');

-- 4. Kiểm tra dữ liệu
SELECT * FROM `size` ORDER BY `size`, `gender`;

-- 5. Kiểm tra thống kê
SELECT `gender`, COUNT(*) as `total` FROM `size` GROUP BY `gender`;
```

## 2. Cập nhật Variant Table (nếu cần)

Để kết nối size với color cho products, cập nhật variant table:

```sql
ALTER TABLE `variant` ADD COLUMN `size_id` INT AFTER `color_id`;
ALTER TABLE `variant` ADD COLUMN `gender` ENUM('male', 'female') AFTER `size_id`;

-- Tạo foreign key
ALTER TABLE `variant` ADD CONSTRAINT `fk_variant_size` 
FOREIGN KEY (`size_id`) REFERENCES `size`(`id`) ON DELETE CASCADE;
```

## 3. Kiểm tra Schema

```sql
-- Kiểm tra structure của size table
DESCRIBE `size`;

-- Expected output:
-- Field       | Type                           | Null | Key | Default             | Extra
-- id          | int                            | NO   | PRI | NULL                | auto_increment
-- size        | int                            | NO   | MUL | NULL                | 
-- gender      | enum('male','female')          | NO   |     | male                | 
-- created_at  | timestamp                      | NO   |     | CURRENT_TIMESTAMP   | 
-- updated_at  | timestamp                      | NO   |     | CURRENT_TIMESTAMP   | on update CURRENT_TIMESTAMP

-- Kiểm tra unique constraint
SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_NAME = 'size' AND INDEX_NAME = 'unique_size_gender';
```

## 4. Kiểm tra API (sau khi cập nhật backend)

### Test Add Size (POST)
```bash
curl -X POST http://localhost:5000/api/admin/sizes \
  -H "Content-Type: application/json" \
  -d '{
    "size": 37,
    "gender": "male"
  }'
```

### Test Get All Sizes (GET)
```bash
curl http://localhost:5000/api/admin/sizes
```

### Test Update Size (PUT)
```bash
curl -X PUT http://localhost:5000/api/admin/sizes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "size": 38,
    "gender": "female"
  }'
```

### Test Delete Size (DELETE)
```bash
curl -X DELETE http://localhost:5000/api/admin/sizes/1
```

## 5. Troubleshooting

### Lỗi: "Unknown column 'gender'"
- Giải pháp: Chạy ALTER TABLE command ở bước 1

### Lỗi: "Duplicate entry for size-gender"
- Giải pháp: Kiểm tra UNIQUE constraint, xóa dữ liệu trùng

### Frontend không hiển thị size
- Kiểm tra: 
  - Size table có dữ liệu chưa?
  - Backend đã khởi động lại chưa (restart server)?
  - Browser DevTools Console có lỗi gì không?

## 6. Rollback (nếu cần khôi phục)

```sql
-- Xóa gender column (nhưng mất dữ liệu)
ALTER TABLE `size` DROP COLUMN `gender`;

-- Hoặc xóa toàn bộ table
DROP TABLE `size`;
```

---

**✅ Sau khi thực hiện:**
1. ✓ Size table có gender column
2. ✓ Dữ liệu mẫu được thêm
3. ✓ Backend controller đã cập nhật
4. ✓ Frontend component hoạt động
5. ✓ 2-step modal có thể thêm size theo giới tính
