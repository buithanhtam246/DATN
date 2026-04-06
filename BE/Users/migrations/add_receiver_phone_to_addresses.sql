-- Kiểm tra và thêm cột receiver_phone vào bảng addresses nếu chưa có
-- Câu lệnh này sẽ chạy nếu cột chưa tồn tại

ALTER TABLE `addresses` ADD COLUMN `receiver_phone` VARCHAR(20) NOT NULL DEFAULT '' AFTER `receiver_name`;

-- Verify - xem cấu trúc bảng addresses
DESCRIBE `addresses`;
