-- Migration: Create genders table for flexible gender management
-- Created: 2026-03-30

CREATE TABLE IF NOT EXISTS genders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  icon VARCHAR(10),
  description TEXT,
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default genders
INSERT INTO genders (id, name, code, icon, description, status) VALUES 
(1, 'Nam', 'male', '👨', 'Dành cho nam giới', 1),
(2, 'Nữ', 'female', '👩', 'Dành cho nữ giới', 1),
(3, 'Unisex', 'unisex', '🔄', 'Dành cho cả nam và nữ', 1);

ALTER TABLE genders AUTO_INCREMENT = 4;
