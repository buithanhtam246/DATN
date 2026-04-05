-- Create product_images table to store multiple images per variant
CREATE TABLE IF NOT EXISTS product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  variant_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_primary TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES variant(id) ON DELETE CASCADE,
  INDEX idx_variant_id (variant_id),
  INDEX idx_is_primary (is_primary)
);
