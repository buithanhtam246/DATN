-- Add images column to products table to store multiple images as JSON
ALTER TABLE products ADD COLUMN images JSON NULL COMMENT 'Array of product images [image1.jpg, image2.jpg, ...]';
