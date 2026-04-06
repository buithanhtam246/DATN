-- Migration: Add receiver_phone column to addresses table
-- Nếu cột chưa tồn tại, sẽ thêm vào

ALTER TABLE `addresses` ADD COLUMN `receiver_phone` VARCHAR(20) DEFAULT '' AFTER `receiver_name`;

-- Xác nhận cột đã được thêm
DESCRIBE `addresses`;

-- Hoặc nếu lỗi "Duplicate column", có nghĩa cột đã tồn tại rồi
-- Chỉ cần chạy lệnh này để kiểm tra:
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='addresses' AND COLUMN_NAME='receiver_phone';
