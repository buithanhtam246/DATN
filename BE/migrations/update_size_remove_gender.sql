-- Migration: Update size table to use parent category instead of gender
-- Drop gender column and ensure category_id references parent categories only

ALTER TABLE `size` DROP COLUMN `gender`;

-- Add a comment to clarify category_id should only reference parent categories
ALTER TABLE `size` MODIFY COLUMN `category_id` int COMMENT 'Danh mục cha (Nam, Nữ, Trẻ em, Unisex)';

-- Create index for better query performance
ALTER TABLE `size` ADD CONSTRAINT `fk_size_category` 
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE;
