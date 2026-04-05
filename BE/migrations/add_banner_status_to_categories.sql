ALTER TABLE categories
ADD COLUMN banner_status ENUM('active','inactive') NOT NULL DEFAULT 'inactive';

UPDATE categories
SET banner_status = CASE
  WHEN parent_id IS NULL
    AND size_guide_image_url IS NOT NULL
    AND size_guide_image_url <> '' THEN 'active'
  ELSE 'inactive'
END;