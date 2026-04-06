-- Tách riêng ảnh của bảng size và categories
-- categories đã dùng: size_guide_image_url
-- size sẽ dùng riêng: size_image_url

ALTER TABLE `size`
ADD COLUMN `size_image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh riêng cho size' AFTER `image_url`;

-- Copy dữ liệu cũ từ image_url sang size_image_url
UPDATE `size`
SET `size_image_url` = `image_url`
WHERE `size_image_url` IS NULL
  AND `image_url` IS NOT NULL;
