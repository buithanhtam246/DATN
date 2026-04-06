-- Add payment_method column to orders table
ALTER TABLE orders 
ADD COLUMN payment_method VARCHAR(100) NULL AFTER payment_method_id;
