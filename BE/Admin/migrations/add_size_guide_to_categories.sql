-- Migration: Add size guide image to categories table
-- Thêm cột lưu ảnh hướng dẫn size vào bảng categories
-- Run this SQL to add the column to the database

ALTER TABLE `categories` ADD COLUMN `size_guide_image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Đường dẫn ảnh hướng dẫn size cho category này';
