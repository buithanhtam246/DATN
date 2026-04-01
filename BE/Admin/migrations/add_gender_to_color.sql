-- Migration: Add gender column to color table
-- Created: 2026-03-30

ALTER TABLE color ADD COLUMN gender VARCHAR(10) DEFAULT 'unisex' AFTER hex_code;
ALTER TABLE color ADD COLUMN status TINYINT DEFAULT 1 AFTER gender;

-- Sample data: Add colors with gender
INSERT INTO color (id, name, hex_code, gender, status, created_at, updated_at) VALUES 
(1, 'Đỏ', '#FF0000', 'unisex', 1, NOW(), NOW()),
(2, 'Xanh Dương', '#0000FF', 'unisex', 1, NOW(), NOW()),
(3, 'Đen', '#000000', 'unisex', 1, NOW(), NOW()),
(4, 'Trắng', '#FFFFFF', 'unisex', 1, NOW(), NOW()),
(5, 'Hồng', '#FFC0CB', 'female', 1, NOW(), NOW()),
(6, 'Xanh Lục', '#008000', 'unisex', 1, NOW(), NOW()),
(7, 'Vàng', '#FFFF00', 'unisex', 1, NOW(), NOW()),
(8, 'Cam', '#FFA500', 'unisex', 1, NOW(), NOW()),
(9, 'Tím', '#800080', 'female', 1, NOW(), NOW()),
(10, 'Xám', '#808080', 'unisex', 1, NOW(), NOW());

ALTER TABLE color AUTO_INCREMENT = 11;
