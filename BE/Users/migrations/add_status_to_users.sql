-- Thêm cột status vào bảng users
ALTER TABLE users ADD COLUMN status ENUM('active', 'blocked') DEFAULT 'active' AFTER otp_expires;
