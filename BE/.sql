-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost:3306
-- Thời gian đã tạo: Th3 26, 2026 lúc 01:51 PM
-- Phiên bản máy phục vụ: 8.4.3
-- Phiên bản PHP: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `datn`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `addresses`
--

CREATE TABLE `addresses` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `receiver_name` varchar(100) NOT NULL,
  `receiver_phone` varchar(20) NOT NULL,
  `full_address` text NOT NULL,
  `is_default` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `receiver_name`, `receiver_phone`, `full_address`, `is_default`) VALUES
(4, 4, 'Nguyen Van B Updated', '0987654321', '789 Đường PQR, Quận 3, TP. HCM', 0),
(5, 4, 'Nguyen Van B', '0912345678', '456 Đường XYZ, Quận 2, TP. HCM', 1),
(6, 7, 'Nguyễn Văn A', '0123456789', '123 Đường ABC, Quận 1, TP.HCM', 0),
(8, 13, 'buithanhtam', '0999999999', '11 truong chinh', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `brand`
--

CREATE TABLE `brand` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `status` tinyint DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `brand`
--

INSERT INTO `brand` (`id`, `name`, `status`) VALUES
(1, 'Nike', 1),
(2, 'Nike', 1),
(3, 'Nike', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart`
--

CREATE TABLE `cart` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `status` tinyint DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 13, 1, '2026-03-06 12:06:32', '2026-03-06 12:06:32'),
(2, 1, 1, '2026-03-06 12:37:33', '2026-03-06 12:37:33'),
(3, 1, 1, '2026-03-06 12:41:45', '2026-03-06 12:41:45'),
(4, 1, 1, '2026-03-06 12:44:28', '2026-03-06 12:44:28'),
(5, NULL, 1, '2026-03-06 12:45:30', '2026-03-06 12:45:30'),
(6, 1, 1, '2026-03-06 13:04:51', '2026-03-06 13:04:51');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_item`
--

CREATE TABLE `cart_item` (
  `id` int NOT NULL,
  `cart_id` int DEFAULT NULL,
  `variant_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `cart_item`
--

INSERT INTO `cart_item` (`id`, `cart_id`, `variant_id`, `quantity`) VALUES
(1, 4, 3, 5);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `status` tinyint DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `status`) VALUES
(1, 'Running Shoes', 1),
(2, 'Quần', 1),
(5, 'Áo', 1),
(8, 'Basketball', 1),
(9, 'thanh tam', 1),
(10, 'nam', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chatbox`
--

CREATE TABLE `chatbox` (
  `chat_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `content_text` text,
  `image_url` text,
  `feedback_ai` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `color`
--

CREATE TABLE `color` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL COMMENT 'Tên màu (Đen, Trắng, Xanh...)',
  `hex_code` varchar(7) DEFAULT NULL COMMENT 'Mã màu HEX (#000000)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `color`
--

INSERT INTO `color` (`id`, `name`, `hex_code`, `created_at`, `updated_at`) VALUES
(1, 'Đen', '#000000', '2026-03-26 13:07:44', '2026-03-26 13:07:44'),
(2, 'Trắng', '#FFFFFF', '2026-03-26 13:07:44', '2026-03-26 13:07:44'),
(3, 'Xanh', '#0000FF', '2026-03-26 13:07:44', '2026-03-26 13:07:44'),
(4, 'Đỏ', '#FF0000', '2026-03-26 13:07:44', '2026-03-26 13:07:44'),
(5, 'Vàng', '#FFFF00', '2026-03-26 13:07:44', '2026-03-26 13:07:44'),
(6, 'Xám', '#808080', '2026-03-26 13:07:44', '2026-03-26 13:07:44'),
(7, 'Nâu', '#A52A2A', '2026-03-26 13:07:44', '2026-03-26 13:07:44'),
(8, 'Hồng', '#FFC0CB', '2026-03-26 13:07:44', '2026-03-26 13:07:44');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `favorite`
--

CREATE TABLE `favorite` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `address_id` int DEFAULT NULL,
  `total_price` decimal(12,2) DEFAULT NULL,
  `delivery_cost` decimal(12,2) DEFAULT '0.00',
  `status` varchar(50) DEFAULT NULL,
  `payment_method_id` int DEFAULT NULL,
  `voucher_id` int DEFAULT NULL,
  `note` text,
  `delivery` varchar(100) DEFAULT NULL,
  `create_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `address_id`, `total_price`, `delivery_cost`, `status`, `payment_method_id`, `voucher_id`, `note`, `delivery`, `create_at`) VALUES
(25, 13, 1, 930000.00, 30000.00, 'pending', 1, 5, 'Giao sáng mai', 'Standard', '2026-03-13 13:18:20'),
(26, 13, 1, 1330000.00, 30000.00, 'delivered', 1, NULL, 'Giao hàng cẩn thận, gọi điện trước khi giao', 'Standard', '2026-03-17 14:02:31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_details`
--

CREATE TABLE `order_details` (
  `id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `variant_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `order_details`
--

INSERT INTO `order_details` (`id`, `order_id`, `variant_id`, `quantity`, `price`) VALUES
(16, 25, 3, 2, 500000.00),
(17, 26, 1, 2, 500000.00),
(18, 26, 2, 1, 300000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_reviews`
--

CREATE TABLE `order_reviews` (
  `id` int NOT NULL,
  `order_detail_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `status` tinyint DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_reviews`
--

INSERT INTO `order_reviews` (`id`, `order_detail_id`, `rating`, `comment`, `created_at`, `status`) VALUES
(1, 18, 5, '1111111', '2026-03-18 16:15:56', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `name`) VALUES
(1, 'COD - Thanh toán khi nhận hàng'),
(2, 'VNPay - Ví điện tử'),
(3, 'Bank Transfer - Chuyển khoản ngân hàng'),
(4, 'Credit Card - Thẻ tín dụng'),
(5, 'Momo - Ví điện tử Momo');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `brand_id` int DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `image` text,
  `describ` text,
  `material` varchar(100) DEFAULT NULL,
  `date_add` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `category_id`, `brand_id`, `name`, `image`, `describ`, `material`, `date_add`) VALUES
(2, 1, NULL, 'Giày Thể Thao', NULL, NULL, NULL, '2026-03-25 09:58:53');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `size`
--

CREATE TABLE `size` (
  `id` int NOT NULL,
  `size` int NOT NULL COMMENT 'Kích thước (35, 36, 37...45)',
  `gender` enum('male','female') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Giới tính (Nam/Nữ)',
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Đường dẫn ảnh hướng dẫn',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `size`
--

INSERT INTO `size` (`id`, `size`, `gender`, `image_url`, `created_at`, `updated_at`) VALUES
(1, 35, 'male', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(2, 36, 'male', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(3, 37, 'male', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(4, 38, 'male', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(5, 39, 'male', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(6, 40, 'male', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(7, 41, 'male', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(8, 42, 'male', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(9, 43, 'male', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(10, 44, 'male', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(11, 45, 'male', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(12, 34, 'female', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(13, 35, 'female', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(14, 36, 'female', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(15, 37, 'female', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(16, 38, 'female', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(17, 39, 'female', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(18, 40, 'female', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(19, 41, 'female', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(20, 42, 'female', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10'),
(21, 43, 'female', NULL, '2026-03-26 13:44:10', '2026-03-26 13:44:10');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `otp` varchar(10) DEFAULT NULL,
  `otp_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `password`, `email`, `phone`, `role`, `otp`, `otp_expires`) VALUES
(1, 'Tâm', '$2b$10$EvvzlMcHoqSPs.KHwcymqOW17pcY5ZrOnsIVP4eWwaR9dO.H2Gikq', 'tam@gmail.com', '0123456789', 'user', NULL, NULL),
(3, 'Nguyen Van A', '$2b$10$pJ8UO/cBjEOkFdbTAIGs/us6VjNVq/W1uxiWzCWgxgC8CEr3VfU16', 'a@example.com', NULL, 'user', NULL, NULL),
(4, 'buithanhtam', '$2b$10$JTkZb4sObVfUPJFjUeelveZnV0PlRSEiUB51MpkWQ0bzQ4/tGRrzS', 'a@example123.com', NULL, 'user', NULL, NULL),
(5, 'buithanhtam', '$2b$10$DMWR/E7MA9f5UYbP..vh8eXNx8tPXPXYMZ6wRpJPI9hiT7ql0DOpO', 'a@example1̀a3.com', NULL, 'user', NULL, NULL),
(6, 'Nguyen Van A', '$2b$10$7SWg5XbycBir/yI0v9sLFOEhQ0lOwTsDe7qhzs2Rfyr7QROFpiApi', 'buithanhtam241005@gmail.com', NULL, 'user', NULL, NULL),
(7, 'Nguyễn Văn A', '$2b$10$51h9PwkAzQTp6KLdJrE3iOiWKwQTo2bcidTevyEIOJJEQkw3tv8QO', 'test@example.com', NULL, 'user', NULL, NULL),
(8, 'Test User', '$2b$10$pmGscfMZEPBfnMRuNX/GhOKyJa1CZuGMPcc.gA4rTNqUibHLk/le2', 'test1234@example.com', NULL, 'user', NULL, NULL),
(9, 'New Test User', '$2b$10$e5ZpjmY.cO5UVxn4Czk72OTQWN3.VoUKDgm9QZHAcWOiS7..pVvzq', 'newtest@example.com', NULL, 'user', NULL, NULL),
(10, 'Bùi Thanh Tâm', '$2b$10$biocGMDeE5LUu4OFqjb27.4Cdz8bjeBiqoKFQzOgZ1yuc5FoxIkaa', 'admin@example.com', NULL, 'user', NULL, NULL),
(11, 'haiduoi', '$2b$10$43GsCVhjqu6KSEQGi.hNouHXD.BMj/bucgGJdFdbSLPfttqK0jap6', 'buithanhtam@gmail.com', NULL, 'user', NULL, NULL),
(13, 'tam', '$2b$10$3FbBEUJB2cPeAOcPS0fhmOujYCZ5Trv254ktwc05sRwaNPd4Z3Daq', 'buithanhtam012021@gmail.com', '0987654321', 'admin', NULL, NULL),
(15, 'tam_amdmin', '241005T@m', 'namcheo67@gmail.com', '1234567891', 'admin', NULL, NULL),
(16, 'thanhtam', '12345678T@m', 'thanhtam@gmail.com', '1234567891', 'user', NULL, NULL),
(17, 'Bùi Thanh Tâm', '$2b$10$FsZ4UsOkHGOvKzwC5x9V3eIgYEhRCM5J8ZTcrZx/9kydCMPN7BdBO', 'buithanhtam012221@gmail.com', NULL, 'user', NULL, NULL),
(19, 'Admin User', '$2b$10$hD2mUD0041z8QYT7VyWCx.YH.HVFKYd7ADw8OagCMNKMMAIUihHFe', 'namcheo@gmail.com', NULL, 'admin', NULL, NULL),
(20, 'Admin User', '$2b$10$hzCu856fDe0x7E4p7RWvxezhZuJE3QYLlYih8x3cOTouvAu6TWbVW', 'namcheo11@gmail.com', NULL, 'admin', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `variant`
--

CREATE TABLE `variant` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `gender` enum('male','female') DEFAULT 'male',
  `color_id` int DEFAULT NULL,
  `size_id` int DEFAULT NULL,
  `price` decimal(12,2) DEFAULT '0.00',
  `price_sale` decimal(12,2) DEFAULT '0.00',
  `quantity` int DEFAULT '0',
  `image` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `variant`
--

INSERT INTO `variant` (`id`, `product_id`, `gender`, `color_id`, `size_id`, `price`, `price_sale`, `quantity`, `image`) VALUES
(3, 2, 'male', NULL, NULL, 1000.00, 0.00, 10, 'product-1774432733436-131971034.png'),
(4, 2, 'male', NULL, NULL, 1200.00, 0.00, 5, 'product-1774432733447-375401404.png');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vouchers`
--

CREATE TABLE `vouchers` (
  `id` int NOT NULL,
  `code_voucher` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name_voucher` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value_reduced` decimal(12,2) DEFAULT NULL,
  `promotion_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `max_value` decimal(12,2) DEFAULT NULL,
  `quantity_user` int DEFAULT NULL,
  `minimum_order` decimal(12,2) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `promotion_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `vouchers`
--

INSERT INTO `vouchers` (`id`, `code_voucher`, `name_voucher`, `value_reduced`, `promotion_type`, `quantity`, `max_value`, `quantity_user`, `minimum_order`, `start_date`, `promotion_date`) VALUES
(5, 'SAVE100K', 'Giảm 100K', 100000.00, 'fixed', 31, NULL, 1, 300000.00, '2026-01-01', '2026-12-31'),
(7, 'HELLO100', 'Chào mừng 100K', 100000.00, 'fixed', 50, NULL, 1, 200000.00, '2026-01-01', '2026-12-31'),
(9, 'TEST110', 'Giảm giá 10% tháng 10', 10.00, 'percentage', 100, 50000.00, 1, 200000.00, '2024-10-01', '2024-10-31'),
(10, 'TEST120', 'Giảm giá 10% tháng 10', 10.00, 'percentage', 100, 50000.00, 1, 200000.00, '2024-10-01', '2024-10-31'),
(11, 'sale11111', 'tam', 50.00, 'percentage', 1, NULL, 1, 0.00, '2026-03-23', '2026-03-23');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `brand`
--
ALTER TABLE `brand`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `cart_item`
--
ALTER TABLE `cart_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cart_id` (`cart_id`),
  ADD KEY `variant_id` (`variant_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `chatbox`
--
ALTER TABLE `chatbox`
  ADD PRIMARY KEY (`chat_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `color`
--
ALTER TABLE `color`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Chỉ mục cho bảng `favorite`
--
ALTER TABLE `favorite`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `payment_method_id` (`payment_method_id`),
  ADD KEY `voucher_id` (`voucher_id`);

--
-- Chỉ mục cho bảng `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `variant_id` (`variant_id`);

--
-- Chỉ mục cho bảng `order_reviews`
--
ALTER TABLE `order_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_detail_id` (`order_detail_id`);

--
-- Chỉ mục cho bảng `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_prod_cat` (`category_id`),
  ADD KEY `fk_prod_brand` (`brand_id`);

--
-- Chỉ mục cho bảng `size`
--
ALTER TABLE `size`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_size_gender` (`size`,`gender`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`);

--
-- Chỉ mục cho bảng `variant`
--
ALTER TABLE `variant`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_variant_product` (`product_id`);

--
-- Chỉ mục cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `brand`
--
ALTER TABLE `brand`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `cart_item`
--
ALTER TABLE `cart_item`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `chatbox`
--
ALTER TABLE `chatbox`
  MODIFY `chat_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `color`
--
ALTER TABLE `color`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `favorite`
--
ALTER TABLE `favorite`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT cho bảng `order_details`
--
ALTER TABLE `order_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `order_reviews`
--
ALTER TABLE `order_reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT cho bảng `size`
--
ALTER TABLE `size`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `variant`
--
ALTER TABLE `variant`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `addresses_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_address_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `cart_item`
--
ALTER TABLE `cart_item`
  ADD CONSTRAINT `cart_item_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`),
  ADD CONSTRAINT `cart_item_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `variant` (`id`);

--
-- Các ràng buộc cho bảng `chatbox`
--
ALTER TABLE `chatbox`
  ADD CONSTRAINT `chatbox_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `favorite`
--
ALTER TABLE `favorite`
  ADD CONSTRAINT `favorite_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `favorite_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `order_reviews`
--
ALTER TABLE `order_reviews`
  ADD CONSTRAINT `order_reviews_ibfk_1` FOREIGN KEY (`order_detail_id`) REFERENCES `order_details` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_prod_brand` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_prod_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `variant`
--
ALTER TABLE `variant`
  ADD CONSTRAINT `fk_variant_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
