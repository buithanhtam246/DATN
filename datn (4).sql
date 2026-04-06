-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost:3306
-- Thời gian đã tạo: Th4 05, 2026 lúc 01:52 PM
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `receiver_name`, `receiver_phone`, `full_address`, `is_default`) VALUES
(4, 4, 'Nguyen Van B Updated', '0987654321', '789 Đường PQR, Quận 3, TP. HCM', 0),
(5, 4, 'Nguyen Van B', '0912345678', '456 Đường XYZ, Quận 2, TP. HCM', 1),
(6, 7, 'Nguyễn Văn A', '0123456789', '123 Đường ABC, Quận 1, TP.HCM', 0),
(12, 21, 'Bùi Thanh Tâm', '0365941110', 'AAAAAAAAAA, Phường Quảng An, Ba Đình, Hà Nội', 0),
(13, 21, 'buithanhtam', '0365941110', 'aaa, Phường Cống Vị, Ba Đình, Hà Nội', 1),
(17, 21, 'aaaaaaaa', '1111111111', 'aa, Phường Cống Vị, Ba Đình, Hà Nội', 0),
(18, 21, 'buithanhtam', '0365941110', '787 truong chinh, Phường Thành Công, Ba Đình, Hà Nội', 0),
(19, 21, 'bui thanh tam', '0365941110', '787 truong chinh, Phường 6, Quận 4, TP. Hồ Chí Minh', 0),
(20, 21, 'bui thanh tam', '0365941110', 'aaa, Phường Quỳnh Lôi, Thanh Xuân, Hà Nội', 0),
(21, 23, 'Bùi Thanh Tâm', '1234567899', '787 thanh tam, Phường Cống Vị, Ba Đình, Hà Nội', 0),
(22, 23, 'Bùi Thanh Tâm', '0365941110', '7877, Phường Cống Vị, Ba Đình, Hà Nội', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `brand`
--

CREATE TABLE `brand` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `status` tinyint DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `brand`
--

INSERT INTO `brand` (`id`, `name`, `status`) VALUES
(2, 'Nike', 1),
(5, 'Jordan', 1),
(6, 'Adidas', 1);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 13, 1, '2026-03-06 12:06:32', '2026-03-06 12:06:32'),
(2, 1, 1, '2026-03-06 12:37:33', '2026-03-06 12:37:33'),
(3, 1, 1, '2026-03-06 12:41:45', '2026-03-06 12:41:45'),
(4, 1, 1, '2026-03-06 12:44:28', '2026-03-06 12:44:28'),
(5, NULL, 1, '2026-03-06 12:45:30', '2026-03-06 12:45:30'),
(6, 1, 1, '2026-03-06 13:04:51', '2026-03-06 13:04:51'),
(7, 21, 1, '2026-04-02 13:40:34', '2026-04-02 13:40:34'),
(8, 23, 1, '2026-04-04 05:49:33', '2026-04-04 05:49:33');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_item`
--

CREATE TABLE `cart_item` (
  `id` int NOT NULL,
  `cart_id` int DEFAULT NULL,
  `variant_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cart_item`
--

INSERT INTO `cart_item` (`id`, `cart_id`, `variant_id`, `quantity`) VALUES
(13, 7, 146, 1),
(14, 7, 145, 4),
(15, 8, 159, 4),
(16, 8, 145, 6),
(17, 7, 159, 5),
(18, 7, 160, 1),
(19, 7, 152, 1),
(20, 7, 247, 205),
(21, 7, 248, 100),
(22, 7, 249, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `status` tinyint DEFAULT '1',
  `size_guide_image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text,
  `banner_status` enum('active','inactive') NOT NULL DEFAULT 'inactive'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `name`, `status`, `size_guide_image_url`, `note`, `banner_status`) VALUES
(36, NULL, 'Nam', 1, 'category-banner-1775317147567-439866103.png', '', 'active'),
(37, 36, 'Bóng rỗ', 1, 'category-banner-1775324606216-140724502.jpg', '', 'active'),
(38, 36, 'Bóng đá', 1, 'category-banner-1775323569067-510340426.jpg', '', 'active'),
(40, NULL, 'Nữ', 1, 'category-banner-1775320230167-31418186.png', '', 'active'),
(42, NULL, 'Trẻ em', 1, 'category-banner-1775317481118-292936497.png', 'tam', 'active'),
(43, 40, 'Giày Bóng rỗ', 1, NULL, NULL, 'inactive'),
(45, 36, 'Gym', 1, 'category-banner-1775325540863-200614092.jpg', '', 'active'),
(46, 36, 'Chạy Bộ', 1, NULL, NULL, 'inactive'),
(47, 36, 'Tennis', 1, 'category-banner-1775325492751-269145657.jpg', '', 'active'),
(48, 36, 'Golf', 1, 'category-banner-1775325761097-274782536.png', '', 'active'),
(49, 40, 'Bóng rỗ', 1, NULL, NULL, 'inactive'),
(50, 40, 'Bóng đá', 1, NULL, NULL, 'inactive'),
(51, 40, 'Gym', 1, NULL, NULL, 'inactive'),
(52, 40, 'Golf', 1, NULL, NULL, 'inactive');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `category_banners`
--

CREATE TABLE `category_banners` (
  `id` int NOT NULL,
  `category_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `color`
--

INSERT INTO `color` (`id`, `name`, `hex_code`, `created_at`, `updated_at`) VALUES
(1, 'Đen', '#000000', '2026-03-26 13:07:44', '2026-03-26 13:07:44'),
(4, 'Đỏ', '#FF0000', '2026-03-26 13:07:44', '2026-03-26 13:07:44'),
(10, 'Trắng', '#fafafa', '2026-04-04 08:51:03', '2026-04-04 08:51:03');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `favorite`
--

CREATE TABLE `favorite` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `address_id` int DEFAULT NULL,
  `delivery_address` varchar(500) DEFAULT NULL,
  `total_price` decimal(12,2) DEFAULT NULL,
  `delivery_cost` decimal(12,2) DEFAULT '0.00',
  `status` varchar(50) DEFAULT NULL,
  `payment_method_id` int DEFAULT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `voucher_id` int DEFAULT NULL,
  `note` text,
  `delivery` varchar(100) DEFAULT NULL,
  `create_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `address_id`, `delivery_address`, `total_price`, `delivery_cost`, `status`, `payment_method_id`, `payment_method`, `voucher_id`, `note`, `delivery`, `create_at`) VALUES
(25, 13, 1, NULL, 930000.00, 30000.00, 'pending', 1, NULL, 5, 'Giao sáng mai', 'Standard', '2026-03-13 13:18:20'),
(26, 13, 1, NULL, 1330000.00, 30000.00, 'delivered', 1, NULL, NULL, 'Giao hàng cẩn thận, gọi điện trước khi giao', 'Standard', '2026-03-17 14:02:31'),
(27, 13, NULL, NULL, 109999.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: buithanh, SĐT: 0365941110, Địa chỉ: thành phố châu đốc ', NULL, '2026-04-02 14:41:04'),
(28, 13, NULL, NULL, 17000.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: tam, SĐT: 0987654321, Địa chỉ: 797/3 trường chinh, Phường 9, Tân Phú, TP. Hồ Chí Minh', NULL, '2026-04-02 15:25:23'),
(29, 13, NULL, NULL, 86992.80, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: tam, SĐT: 0987654321, Địa chỉ: 11111, Phường 15, Quận 4, TP. Hồ Chí Minh', NULL, '2026-04-02 15:32:47'),
(30, 13, NULL, NULL, 39999.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: tam, SĐT: 0987654321, Địa chỉ: tam 1, Phường Quảng An, Ba Đình, Hà Nội', NULL, '2026-04-02 15:38:40'),
(31, 21, NULL, NULL, 39999.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: Bùi Thanh Tâm, SĐT: 0365941110, Địa chỉ: 11111111111, Phường Liễu Giai, Ba Đình, Hà Nội', NULL, '2026-04-02 18:14:05'),
(32, 21, NULL, NULL, 31000.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: Bùi Thanh Tâm, SĐT: 0365941110, Địa chỉ: tam, Phường Bình Hiên, Hải Châu, Đà Nẵng', NULL, '2026-04-02 18:32:20'),
(33, 21, NULL, 'tam1, Phường An Hải Đông, Sơn Trà, Đà Nẵng', 31000.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: Bùi Thanh Tâm, SĐT: 0365941110, Địa chỉ: tam1, Phường An Hải Đông, Sơn Trà, Đà Nẵng', NULL, '2026-04-02 18:37:09'),
(34, 21, NULL, '22222222, Phường 3, Quận 5, TP. Hồ Chí Minh', 16000.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: Bùi Thanh Tâm, SĐT: 0365941110, Địa chỉ: 22222222, Phường 3, Quận 5, TP. Hồ Chí Minh', NULL, '2026-04-02 18:40:30'),
(35, 13, 10, 'y 66, Phường 5, Quận 5, TP. Hồ Chí Minh', 38000.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: tam, SĐT: 0987654321, Địa chỉ: y 66, Phường 5, Quận 5, TP. Hồ Chí Minh', NULL, '2026-04-02 18:44:34'),
(36, 21, NULL, 'aaaaaa, Phường Hòa Cường Nam, Hải Châu, Đà Nẵng', 37992.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: Bùi Thanh Tâm, SĐT: 1111111111, Địa chỉ: aaaaaa, Phường Hòa Cường Nam, Hải Châu, Đà Nẵng', NULL, '2026-04-02 18:45:40'),
(37, 21, 11, 'aaaaaa, Phường 6, Quận 6, TP. Hồ Chí Minh', 39999.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: Bùi Thanh Tâm, SĐT: 1212121212, Địa chỉ: aaaaaa, Phường 6, Quận 6, TP. Hồ Chí Minh', NULL, '2026-04-02 18:51:13'),
(38, 21, 11, 'aaaaaa, Phường 6, Quận 6, TP. Hồ Chí Minh', 34998.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: Bùi Thanh Tâm, SĐT: 999999999, Địa chỉ: aaaaaa, Phường 6, Quận 6, TP. Hồ Chí Minh', NULL, '2026-04-02 18:54:32'),
(39, 13, 10, 'y 66, Phường 5, Quận 5, TP. Hồ Chí Minh', 15999.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: tam, SĐT: 78787878, Địa chỉ: y 66, Phường 5, Quận 5, TP. Hồ Chí Minh', NULL, '2026-04-02 18:56:42'),
(40, 21, NULL, 'THANHTAM, Phường Ngọc Hà, Ba Đình, Hà Nội', 32997.00, 30000.00, 'cancelled', NULL, NULL, NULL, 'Người nhận: Bùi Thanh Tâm, SĐT: 1222222222222, Địa chỉ: THANHTAM, Phường Ngọc Hà, Ba Đình, Hà Nội', NULL, '2026-04-02 18:58:31'),
(41, 21, 12, 'AAAAAAAAAA, Phường Quảng An, Ba Đình, Hà Nội', 39999.00, 30000.00, 'delivered', NULL, NULL, NULL, 'Người nhận: Bùi Thanh Tâm, SĐT: , Địa chỉ: AAAAAAAAAA, Phường Quảng An, Ba Đình, Hà Nội', 'COD', '2026-04-02 19:06:35'),
(42, 21, 12, 'AAAAAAAAAA, Phường Quảng An, Ba Đình, Hà Nội', 30999.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: Bùi Thanh Tâm, SĐT: , Địa chỉ: AAAAAAAAAA, Phường Quảng An, Ba Đình, Hà Nội', 'BANK_TRANSFER', '2026-04-02 19:07:18'),
(43, 21, 12, 'AAAAAAAAAA, Phường Quảng An, Ba Đình, Hà Nội', 15999.00, 30000.00, 'pending', NULL, NULL, NULL, 'Người nhận: Bùi Thanh Tâm, SĐT: , Địa chỉ: AAAAAAAAAA, Phường Quảng An, Ba Đình, Hà Nội', 'COD', '2026-04-03 03:32:11'),
(44, 21, NULL, '111111111111, Phường Cống Vị, Ba Đình, Hà Nội', 40998.00, 30000.00, 'confirmed', NULL, NULL, NULL, 'Người nhận: buithanhtam, SĐT: 0365941110, Địa chỉ: 111111111111, Phường Cống Vị, Ba Đình, Hà Nội', 'COD', '2026-04-03 03:54:17'),
(45, 21, 12, 'AAAAAAAAAA, Phường Quảng An, Ba Đình, Hà Nội', 31998.00, 30000.00, 'delivered', NULL, NULL, NULL, 'Người nhận: Bùi Thanh Tâm, SĐT: , Địa chỉ: AAAAAAAAAA, Phường Quảng An, Ba Đình, Hà Nội', 'COD', '2026-04-03 03:59:34'),
(46, 21, 12, 'AAAAAAAAAA, Phường Quảng An, Ba Đình, Hà Nội', 49998.00, 30000.00, 'delivered', NULL, NULL, NULL, 'aa', 'COD', '2026-04-03 04:07:21'),
(47, 13, 9, 'tam 1, Phường Quảng An, Ba Đình, Hà Nội', 30999.00, 30000.00, 'delivered', NULL, 'COD', NULL, 'sanpham', 'COD', '2026-04-03 17:05:36'),
(48, 13, 9, 'tam 1, Phường Quảng An, Ba Đình, Hà Nội', 30100.00, 30000.00, 'cancelled', NULL, 'COD - Thanh toán khi nhận hàng', NULL, '', 'COD - Thanh toán khi nhận hàng', '2026-04-03 17:14:23'),
(49, 21, 13, 'aaa, Phường Cống Vị, Ba Đình, Hà Nội', 30100.00, 30000.00, 'delivered', NULL, 'VNPay - Ví điện tử', NULL, 'aaaa', 'VNPay - Ví điện tử', '2026-04-03 17:26:30'),
(50, 23, NULL, '787 tam, Phường Kim Mã, Ba Đình, Hà Nội', 10029990.00, 30000.00, 'delivered', NULL, 'Credit Card - Thẻ tín dụng', NULL, 'thanh tam', 'Credit Card - Thẻ tín dụng', '2026-04-04 09:21:51'),
(51, 13, NULL, 'a', 30100.00, 30000.00, 'delivered', NULL, 'COD - Thanh toán khi nhận hàng', NULL, '', 'COD - Thanh toán khi nhận hàng', '2026-04-04 14:00:30');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_details`
--

INSERT INTO `order_details` (`id`, `order_id`, `variant_id`, `quantity`, `price`) VALUES
(16, 25, 3, 2, 500000.00),
(17, 26, 1, 2, 500000.00),
(18, 26, 2, 1, 300000.00),
(19, 27, 120, 1, 99999.00),
(20, 28, 119, 2, 10000.00),
(21, 29, 120, 9, 99999.00),
(22, 30, 120, 1, 99999.00),
(23, 31, 120, 1, 99999.00),
(24, 32, 119, 1, 10000.00),
(25, 33, 119, 1, 10000.00),
(26, 34, 119, 1, 10000.00),
(27, 35, 119, 8, 10000.00),
(28, 36, 129, 8, 100000.00),
(29, 37, 120, 1, 99999.00),
(30, 38, 120, 2, 99999.00),
(31, 39, 129, 1, 100000.00),
(32, 40, 132, 3, 100000.00),
(33, 41, 120, 1, 99999.00),
(34, 42, 131, 1, 100000.00),
(35, 43, 131, 1, 100000.00),
(36, 44, 129, 1, 100000.00),
(37, 44, 120, 1, 99999.00),
(38, 45, 129, 2, 999.00),
(39, 46, 120, 2, 9999.00),
(40, 47, 130, 1, 999.00),
(41, 48, 145, 1, 100.00),
(42, 49, 145, 1, 100.00),
(43, 50, 159, 10, 999999.00),
(44, 51, 145, 1, 100.00);

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
(1, 18, 5, '1111111', '2026-03-18 16:15:56', 1),
(2, 39, 5, 'tsanr phẩm đẹp', '2026-04-03 05:00:13', 1),
(3, 43, 5, 'co xuan', '2026-04-04 09:24:07', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `images` json DEFAULT NULL COMMENT 'Array of product images',
  `describ` text,
  `material` varchar(100) DEFAULT NULL,
  `date_add` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `category_id`, `brand_id`, `name`, `image`, `images`, `describ`, `material`, `date_add`) VALUES
(54, 37, 5, 'tam', 'product-1775198848400-23173945.jpg', '\"[\\\"product-1775198848400-23173945.jpg\\\",\\\"product-1775198848425-392449330.jpg\\\",\\\"product-1775198848431-839047875.jpg\\\"]\"', 'tttt', NULL, '2026-04-03 06:47:28'),
(55, 37, 5, 'test5', 'product-1775214618830-105164297.jpg', '\"[\\\"product-1775214618830-105164297.jpg\\\"]\"', 'thanh tam', NULL, '2026-04-03 11:10:18'),
(58, 37, 2, 'Nike Air 1 Max120', 'product-1775290270153-915290516.png', '\"[\\\"product-1775290270153-915290516.png\\\",\\\"product-1775290270209-634047016.png\\\",\\\"product-1775290270219-968470901.png\\\",\\\"product-1775290270225-780051776.png\\\",\\\"product-1775290270232-650133561.png\\\",\\\"product-1775290270236-608055827.png\\\",\\\"product-1775290270249-9556919.png\\\",\\\"product-1775290270277-482292400.jpg\\\"]\"', 'san pham', NULL, '2026-04-04 08:11:10'),
(59, 37, 2, 'Nike Air 1 ', 'product-1775290901725-612411524.jpg', '\"[\\\"product-1775290901725-612411524.jpg\\\",\\\"product-1775290901771-954367861.png\\\",\\\"product-1775290901808-704373701.png\\\",\\\"product-1775290901819-988821475.png\\\",\\\"product-1775290901825-15515839.png\\\",\\\"product-1775290901831-500386536.png\\\",\\\"product-1775290901837-287801002.png\\\",\\\"product-1775290901851-129343737.png\\\"]\"', 'san phẩm', NULL, '2026-04-04 08:21:41'),
(60, 37, 5, 'Jordan12', 'product-1775292508685-360809947.png', '\"[\\\"product-1775292508685-360809947.png\\\",\\\"product-1775292508711-500607728.png\\\",\\\"product-1775292508750-595812114.png\\\",\\\"product-1775292508759-526962354.png\\\",\\\"product-1775292508774-358898791.png\\\",\\\"product-1775292508785-732100415.png\\\",\\\"product-1775292508797-499964311.png\\\"]\"', 'Giày đẹp', NULL, '2026-04-04 08:48:28'),
(61, 37, 5, 'co xuan', 'product-1775296647069-204462377.png', '\"[\\\"product-1775296647069-204462377.png\\\",\\\"product-1775296647092-783489154.png\\\",\\\"product-1775296647110-608982373.png\\\"]\"', '', NULL, '2026-04-04 09:57:27'),
(62, 46, 2, 'test12', 'product-1775327992946-629461983.png', '\"[\\\"product-1775327992946-629461983.png\\\"]\"', 'giày đẹp', NULL, '2026-04-04 18:39:52'),
(63, 37, 6, 'aa', 'product-1775328456905-595644772.png', '\"[\\\"product-1775328456905-595644772.png\\\"]\"', '', NULL, '2026-04-04 18:47:36'),
(64, 37, 2, 'test8', 'product-1775329783895-4642887.png', '\"[\\\"product-1775329783895-4642887.png\\\",\\\"product-1775329783909-911784642.png\\\",\\\"product-1775329783913-510998299.png\\\"]\"', 'aaa', NULL, '2026-04-04 19:09:43'),
(65, 37, 2, 'a', 'product-1775330673507-410855414.png', '\"[\\\"product-1775330673507-410855414.png\\\"]\"', 'a', NULL, '2026-04-04 19:24:33'),
(66, 37, 2, 's', 'product-1775330764055-582719278.png', '\"[\\\"product-1775330764055-582719278.png\\\"]\"', '', NULL, '2026-04-04 19:26:04'),
(67, 37, 6, 'ab', 'product-1775331373323-342670751.png', '\"[\\\"product-1775331373323-342670751.png\\\"]\"', '', NULL, '2026-04-04 19:36:13'),
(68, 37, 2, 'ưrrr', 'product-1775332447820-621287577.png', '\"[\\\"product-1775332447820-621287577.png\\\"]\"', 'a', NULL, '2026-04-04 19:54:07'),
(69, 37, 6, 'tam', 'product-1775332540289-323090611.png', '\"[\\\"product-1775332540289-323090611.png\\\"]\"', 'aa', NULL, '2026-04-04 19:55:40'),
(70, 37, 5, 'tam', 'product-1775368458883-601457740.png', '\"[\\\"product-1775368458883-601457740.png\\\"]\"', 'aa', NULL, '2026-04-05 05:54:18'),
(71, 37, 6, 'aa', 'product-1775368512342-856405892.png', '\"[\\\"product-1775368512342-856405892.png\\\"]\"', 'aa', NULL, '2026-04-05 05:55:12'),
(72, 37, 5, 'test20', 'product-1775369443479-217462540.png', '\"[\\\"product-1775369443479-217462540.png\\\",\\\"product-1775369443496-220334516.png\\\",\\\"product-1775369443517-230438853.png\\\",\\\"product-1775369443523-647206742.png\\\"]\"', '', NULL, '2026-04-05 06:10:43'),
(73, 37, 5, '12', 'product-1775369544133-304861916.png', '\"[\\\"product-1775369544133-304861916.png\\\",\\\"product-1775369544160-832152536.png\\\",\\\"product-1775369544165-395121335.png\\\",\\\"product-1775369544172-176960303.png\\\"]\"', '', NULL, '2026-04-05 06:12:24'),
(74, 37, 6, '90', 'product-1775371291545-732132079.png', '\"[\\\"product-1775371291545-732132079.png\\\",\\\"product-1775371291553-149728978.png\\\",\\\"product-1775371291559-814026511.png\\\",\\\"product-1775371291566-404442617.png\\\"]\"', '', NULL, '2026-04-05 06:41:31'),
(75, 37, 6, 'tam80', 'product-1775372058880-428197483.png', '\"[\\\"product-1775372058880-428197483.png\\\",\\\"product-1775372058893-171548676.png\\\",\\\"product-1775372058898-826775263.png\\\",\\\"product-1775372058912-884153974.png\\\"]\"', 'aa', NULL, '2026-04-05 06:54:18'),
(76, 37, 6, 'tammm112', 'product-1775372833213-777594900.png', '[\"product-1775372833213-777594900.png\", \"product-1775372833228-425203324.png\", \"product-1775372833236-297852982.png\"]', '', NULL, '2026-04-05 07:07:13'),
(77, 37, 5, '901', 'product-1775373897952-307100366.png', '{\"common\": [\"product-1775373897959-816588728.png\"], \"byColor\": {\"1\": [\"product-1775373897947-133147386.png\"]}}', '', NULL, '2026-04-05 07:24:57');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `size`
--

CREATE TABLE `size` (
  `id` int NOT NULL,
  `size` int NOT NULL COMMENT 'Kích thước (35, 36, 37...45)',
  `category_id` int DEFAULT NULL COMMENT 'Danh mục cha (Nam, Nữ, Trẻ em, Unisex)',
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Đường dẫn ảnh hướng dẫn',
  `size_image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh riêng cho size',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `size`
--

INSERT INTO `size` (`id`, `size`, `category_id`, `image_url`, `size_image_url`, `created_at`, `updated_at`) VALUES
(57, 40, 40, NULL, NULL, '2026-04-02 17:24:06', '2026-04-02 17:24:06'),
(59, 35, 36, NULL, NULL, '2026-04-02 17:41:01', '2026-04-02 17:41:01'),
(60, 36, 36, NULL, NULL, '2026-04-02 17:41:01', '2026-04-02 17:41:01'),
(61, 37, 36, NULL, NULL, '2026-04-02 17:41:01', '2026-04-02 17:41:01'),
(62, 34, 36, NULL, NULL, '2026-04-04 09:56:09', '2026-04-04 09:56:09');

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
  `otp_expires` datetime DEFAULT NULL,
  `status` enum('active','blocked') DEFAULT 'active',
  `locked_at` timestamp NULL DEFAULT NULL,
  `locked_reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `password`, `email`, `phone`, `role`, `otp`, `otp_expires`, `status`, `locked_at`, `locked_reason`) VALUES
(1, 'Tâm', '$2b$10$EvvzlMcHoqSPs.KHwcymqOW17pcY5ZrOnsIVP4eWwaR9dO.H2Gikq', 'tam@gmail.com', '0123456789', 'user', NULL, NULL, 'active', NULL, NULL),
(3, 'Nguyen Van A', '$2b$10$pJ8UO/cBjEOkFdbTAIGs/us6VjNVq/W1uxiWzCWgxgC8CEr3VfU16', 'a@example.com', NULL, 'user', NULL, NULL, 'active', NULL, NULL),
(4, 'buithanhtam', '$2b$10$JTkZb4sObVfUPJFjUeelveZnV0PlRSEiUB51MpkWQ0bzQ4/tGRrzS', 'a@example123.com', NULL, 'user', NULL, NULL, 'active', NULL, NULL),
(5, 'buithanhtam', '$2b$10$DMWR/E7MA9f5UYbP..vh8eXNx8tPXPXYMZ6wRpJPI9hiT7ql0DOpO', 'a@example1̀a3.com', NULL, 'user', NULL, NULL, 'active', NULL, NULL),
(7, 'Nguyễn Văn A', '$2b$10$51h9PwkAzQTp6KLdJrE3iOiWKwQTo2bcidTevyEIOJJEQkw3tv8QO', 'test@example.com', NULL, 'user', NULL, NULL, 'active', NULL, NULL),
(8, 'Test User', '$2b$10$pmGscfMZEPBfnMRuNX/GhOKyJa1CZuGMPcc.gA4rTNqUibHLk/le2', 'test1234@example.com', NULL, 'user', NULL, NULL, 'active', NULL, NULL),
(9, 'New Test User', '$2b$10$e5ZpjmY.cO5UVxn4Czk72OTQWN3.VoUKDgm9QZHAcWOiS7..pVvzq', 'newtest@example.com', NULL, 'user', NULL, NULL, 'active', NULL, NULL),
(10, 'Bùi Thanh Tâm', '$2b$10$biocGMDeE5LUu4OFqjb27.4Cdz8bjeBiqoKFQzOgZ1yuc5FoxIkaa', 'admin@example.com', NULL, 'user', NULL, NULL, 'active', NULL, NULL),
(11, 'haiduoi', '$2b$10$43GsCVhjqu6KSEQGi.hNouHXD.BMj/bucgGJdFdbSLPfttqK0jap6', 'buithanhtam@gmail.com', NULL, 'user', NULL, NULL, 'active', NULL, NULL),
(13, 'tam', '$2b$10$3FbBEUJB2cPeAOcPS0fhmOujYCZ5Trv254ktwc05sRwaNPd4Z3Daq', 'buithanhtam012021@gmail.com', '0987654321', 'admin', NULL, NULL, 'active', NULL, NULL),
(15, 'tam_amdmin', '241005T@m', 'namcheo67@gmail.com', '1234567891', 'admin', NULL, NULL, 'active', NULL, NULL),
(16, 'thanhtam', '12345678T@m', 'thanhtam@gmail.com', '1234567891', 'user', NULL, NULL, 'active', NULL, NULL),
(17, 'Bùi Thanh Tâm', '$2b$10$FsZ4UsOkHGOvKzwC5x9V3eIgYEhRCM5J8ZTcrZx/9kydCMPN7BdBO', 'buithanhtam012221@gmail.com', NULL, 'user', NULL, NULL, 'active', NULL, NULL),
(19, 'Admin User', '$2b$10$hD2mUD0041z8QYT7VyWCx.YH.HVFKYd7ADw8OagCMNKMMAIUihHFe', 'namcheo@gmail.com', NULL, 'admin', NULL, NULL, 'active', NULL, NULL),
(20, 'Admin User', '$2b$10$hzCu856fDe0x7E4p7RWvxezhZuJE3QYLlYih8x3cOTouvAu6TWbVW', 'namcheo11@gmail.com', NULL, 'admin', NULL, NULL, 'active', NULL, NULL),
(21, 'Bùi Thanh Tâm', '$2b$10$yQ4m2umD.5MaaIaELE63cOouctYbNCmdDXM3GzZ85St/AAmIOZlIG', 'buithanhtam241005@gmail.com', NULL, 'user', NULL, NULL, 'active', NULL, NULL),
(22, 'HaiDepTraiKhoaiTo6Mui', '$2b$10$hJ1B.Oxjj2RbvEiMg1UG3ONKZaKWCU3eNwQ73qmfCzzHlj3.aw2DS', 'marshmello.kk@gmail.com', NULL, 'user', NULL, NULL, 'active', NULL, NULL),
(23, 'HaiDepTraiKhoaiTo9MuiMit', '$2b$10$/Qqd08g/eVwuNsjOp957u.NXBKYGahP4PPr3f80dG9YO6Q9idEZOu', 'chipheongunhubo@gmail.com', NULL, 'user', NULL, NULL, 'active', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `variant`
--

CREATE TABLE `variant` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `color_id` int DEFAULT NULL,
  `size_id` int DEFAULT NULL,
  `price` decimal(12,2) DEFAULT '0.00',
  `price_sale` decimal(12,2) DEFAULT '0.00',
  `quantity` int DEFAULT '0',
  `image` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `variant`
--

INSERT INTO `variant` (`id`, `product_id`, `color_id`, `size_id`, `price`, `price_sale`, `quantity`, `image`) VALUES
(145, 54, 1, 59, 1000.00, 100.00, 0, 'product-1775198848400-23173945.jpg'),
(146, 54, 1, 60, 1000.00, 100.00, 9, 'product-1775198848400-23173945.jpg'),
(147, 55, 1, 59, 10000.00, 1000.00, 10, 'product-1775214618830-105164297.jpg'),
(148, 55, 1, 60, 10000.00, 1000.00, 10, 'product-1775214618830-105164297.jpg'),
(149, 55, 1, 61, 10000.00, 1000.00, 10, 'product-1775214618830-105164297.jpg'),
(152, 58, 1, 59, 1000000.00, 0.00, 19, 'product-1775290270153-915290516.png'),
(153, 58, 1, 60, 1000000.00, 0.00, 20, 'product-1775290270153-915290516.png'),
(156, 60, 1, 59, 100000.00, 900000.00, 20, 'product-1775292508685-360809947.png'),
(157, 60, 1, 60, 100000.00, 900000.00, 20, 'product-1775292508685-360809947.png'),
(158, 60, 1, 61, 100000.00, 900000.00, 20, 'product-1775292508685-360809947.png'),
(159, 59, 1, 59, 999999.00, 0.00, 44, 'product-1775292741500-191681857.png'),
(160, 59, 1, 60, 999999.00, 0.00, 50, 'product-1775290901725-612411524.jpg'),
(161, 59, 10, NULL, 800000.00, 0.00, 50, 'product-1775290901725-612411524.jpg'),
(162, 61, 1, 62, 100000000.00, 0.00, 0, 'product-1775296647021-15721220.png'),
(163, 61, 1, 59, 100000000.00, 0.00, 0, 'product-1775296647069-204462377.png'),
(164, 61, 1, 60, 100000000.00, 0.00, 0, 'product-1775296647069-204462377.png'),
(165, 61, 1, 61, 100000000.00, 0.00, 0, 'product-1775296647069-204462377.png'),
(166, 61, 4, 62, 100000000.00, 0.00, 0, 'product-1775296647069-204462377.png'),
(167, 61, 4, 59, 100000000.00, 0.00, 0, 'product-1775296647069-204462377.png'),
(168, 61, 4, 60, 100000000.00, 0.00, 0, 'product-1775296647069-204462377.png'),
(169, 61, 4, 61, 100000000.00, 0.00, 0, 'product-1775296647069-204462377.png'),
(170, 62, 10, 62, 1000000.00, 0.00, 50, 'product-1775327992946-629461983.png'),
(171, 62, 10, 59, 1000000.00, 0.00, 50, 'product-1775327992946-629461983.png'),
(172, 62, 10, 60, 1000000.00, 0.00, 50, 'product-1775327992946-629461983.png'),
(173, 62, 10, 61, 1000000.00, 0.00, 50, 'product-1775327992946-629461983.png'),
(174, 63, 1, 62, 100000.00, 100000.00, 20, 'product-1775328456905-595644772.png'),
(175, 63, 1, 59, 100000.00, 100000.00, 20, 'product-1775328456905-595644772.png'),
(176, 63, 1, 60, 100000.00, 100000.00, 20, 'product-1775328456905-595644772.png'),
(177, 63, 1, 61, 100000.00, 100000.00, 20, 'product-1775328456905-595644772.png'),
(178, 64, 10, 62, 1000000.00, 0.00, 10, 'product-1775329783833-920966348.png'),
(179, 64, 10, 59, 1000000.00, 0.00, 10, 'product-1775329783895-4642887.png'),
(180, 64, 10, 60, 1000000.00, 0.00, 10, 'product-1775329783895-4642887.png'),
(181, 64, 1, 62, 1000000.00, 999999.00, 10, 'product-1775329783895-4642887.png'),
(182, 64, 1, 59, 1000000.00, 999999.00, 10, 'product-1775329783895-4642887.png'),
(183, 64, 1, 60, 1000000.00, 999999.00, 10, 'product-1775329783895-4642887.png'),
(184, 65, 10, 62, 111.00, 0.00, 11, 'product-1775330673507-410855414.png'),
(185, 65, 10, 59, 111.00, 0.00, 11, 'product-1775330673507-410855414.png'),
(186, 65, 10, 62, 111.00, 11.00, 11, 'product-1775330673507-410855414.png'),
(187, 66, 10, 62, 11123.00, 1111.00, 11, 'product-1775330764050-395596332.png'),
(188, 66, 10, 59, 11123.00, 1111.00, 11, 'product-1775330764055-582719278.png'),
(189, 66, 10, 60, 11123.00, 1111.00, 11, 'product-1775330764055-582719278.png'),
(190, 66, 1, 62, 11123.00, 1111.00, 11, 'product-1775330764055-582719278.png'),
(191, 66, 1, 59, 11123.00, 1111.00, 11, 'product-1775330764055-582719278.png'),
(192, 67, 10, 62, 1000.00, 0.00, 10, 'product-1775331373298-340074736.png'),
(193, 67, 10, 59, 1000.00, 0.00, 10, 'product-1775331373301-893648166.jpg'),
(194, 67, 10, 60, 1000.00, 0.00, 10, 'product-1775331373322-162549806.jpg'),
(195, 67, 1, 62, 1000.00, 0.00, 10, 'product-1775331373323-342670751.png'),
(196, 67, 4, 60, 1000.00, 0.00, 10, 'product-1775331373323-342670751.png'),
(197, 67, 4, 59, 1000.00, 0.00, 10, 'product-1775331373323-342670751.png'),
(198, 68, 1, 62, 10000.00, 0.00, 10, 'product-1775332447820-621287577.png'),
(199, 68, 1, 59, 10000.00, 0.00, 10, 'product-1775332447820-621287577.png'),
(200, 68, 10, 62, 10000.00, 0.00, 10, 'product-1775332447813-957957420.png'),
(201, 68, 10, 59, 10000.00, 0.00, 10, 'product-1775332447813-957957420.png'),
(202, 68, 10, 60, 10000.00, 0.00, 10, 'product-1775332447813-957957420.png'),
(203, 69, 10, 62, 1000.00, 0.00, 10, 'product-1775332540289-323090611.png'),
(204, 69, 10, 59, 1000.00, 0.00, 10, 'product-1775332540289-323090611.png'),
(205, 69, 10, 60, 1000.00, 0.00, 10, 'product-1775332540289-323090611.png'),
(206, 69, 1, 62, 1000.00, 0.00, 10, 'product-1775332540283-194334669.png'),
(207, 69, 1, 59, 1000.00, 0.00, 10, 'product-1775332540283-194334669.png'),
(208, 69, 1, 60, 1000.00, 0.00, 10, 'product-1775332540283-194334669.png'),
(209, 69, 4, 62, 1000.00, 0.00, 10, 'product-1775332540288-95209803.jpg'),
(210, 69, 4, 59, 1000.00, 0.00, 10, 'product-1775332540288-95209803.jpg'),
(211, 70, 1, 62, 100000.00, 0.00, 10, 'product-1775368458883-601457740.png'),
(212, 70, 1, 59, 100000.00, 0.00, 10, 'product-1775368458883-601457740.png'),
(213, 71, 1, 62, 1000.00, 0.00, 10, 'product-1775368512342-856405892.png'),
(214, 71, 1, 59, 999.00, 0.00, 10, 'product-1775368512342-856405892.png'),
(215, 72, 1, 62, 1000.00, 0.00, 0, 'product-1775369443479-217462540.png'),
(216, 72, 1, 59, 9999.00, 0.00, 10, 'product-1775369443469-926629148.png'),
(217, 72, 10, 62, 9999.00, 0.00, 0, 'product-1775369443479-217462540.png'),
(218, 72, 10, 59, 9999.00, 0.00, 0, 'product-1775369443479-217462540.png'),
(219, 72, 10, 60, 9999.00, 0.00, 0, 'product-1775369443479-217462540.png'),
(220, 73, 10, 62, 100.00, 0.00, 10, 'product-1775369544133-304861916.png'),
(221, 73, 10, 60, 100.00, 0.00, 10, 'product-1775369544133-304861916.png'),
(222, 73, 10, 59, 100.00, 0.00, 10, 'product-1775369544133-304861916.png'),
(223, 73, 10, 61, 999.00, 0.00, 10, 'product-1775369544133-304861916.png'),
(224, 73, 1, 61, 19999.00, 0.00, 10, 'product-1775369544125-966814090.png'),
(225, 73, 1, 62, 19999.00, 0.00, 10, 'product-1775369544125-966814090.png'),
(226, 73, 1, 59, 19999.00, 0.00, 10, 'product-1775369544125-966814090.png'),
(227, 73, 1, 60, 19999.00, 0.00, 10, 'product-1775369544125-966814090.png'),
(228, 74, 10, 60, 10000.00, 0.00, 0, 'product-1775371291545-732132079.png'),
(229, 74, 10, 62, 10000.00, 0.00, 0, 'product-1775371291545-732132079.png'),
(230, 74, 10, 59, 10000.00, 0.00, 0, 'product-1775371291545-732132079.png'),
(231, 74, 1, 60, 10000.00, 0.00, 10, 'product-1775371291510-180570847.png'),
(232, 74, 1, 59, 10000.00, 0.00, 10, 'product-1775371291510-180570847.png'),
(233, 74, 1, 62, 10000.00, 0.00, 10, 'product-1775371291510-180570847.png'),
(234, 75, 10, 62, 199.00, 0.00, 10, 'product-1775372058880-428197483.png'),
(235, 75, 10, 59, 199.00, 0.00, 10, 'product-1775372058880-428197483.png'),
(236, 75, 10, 60, 199.00, 0.00, 10, 'product-1775372058880-428197483.png'),
(237, 75, 1, 61, 190.00, 0.00, 10, 'product-1775372058861-872482468.png'),
(238, 75, 1, 62, 190.00, 0.00, 10, 'product-1775372058861-872482468.png'),
(239, 75, 1, 59, 190.00, 0.00, 10, 'product-1775372058861-872482468.png'),
(240, 75, 1, 60, 190.00, 0.00, 10, 'product-1775372058861-872482468.png'),
(241, 76, 10, 59, 10000.00, 0.00, 0, 'product-1775372833213-777594900.png'),
(242, 76, 10, 62, 10000.00, 0.00, 0, 'product-1775372833213-777594900.png'),
(243, 76, 10, 60, 10000.00, 0.00, 0, 'product-1775372833213-777594900.png'),
(244, 76, 1, 62, 10000.00, 0.00, 0, 'product-1775372833194-667371669.png'),
(245, 76, 1, 59, 10000.00, 0.00, 0, 'product-1775372833194-667371669.png'),
(246, 76, 1, 60, 10000.00, 0.00, 0, 'product-1775372833194-667371669.png'),
(247, 77, 10, 62, 1000.00, 0.00, 100, 'product-1775373897952-307100366.png'),
(248, 77, 10, 59, 1000.00, 0.00, 100, 'product-1775373897952-307100366.png'),
(249, 77, 1, 59, 1000.00, 0.00, 100, 'product-1775373897916-975646710.png'),
(250, 77, 1, 62, 1000.00, 0.00, 100, 'product-1775373897916-975646710.png');

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
(21, 'giam50k', 'thanhtam', 30.00, 'percentage', 1, 20000.00, NULL, 100000.00, '2026-04-03', '2026-04-16');

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Chỉ mục cho bảng `category_banners`
--
ALTER TABLE `category_banners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category_banners_category` (`category_id`);

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
  ADD UNIQUE KEY `unique_size_gender` (`size`),
  ADD KEY `fk_size_category` (`category_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT cho bảng `brand`
--
ALTER TABLE `brand`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `cart_item`
--
ALTER TABLE `cart_item`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT cho bảng `category_banners`
--
ALTER TABLE `category_banners`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `chatbox`
--
ALTER TABLE `chatbox`
  MODIFY `chat_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `color`
--
ALTER TABLE `color`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `favorite`
--
ALTER TABLE `favorite`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT cho bảng `order_details`
--
ALTER TABLE `order_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT cho bảng `order_reviews`
--
ALTER TABLE `order_reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT cho bảng `size`
--
ALTER TABLE `size`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT cho bảng `variant`
--
ALTER TABLE `variant`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=251;

--
-- AUTO_INCREMENT cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

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
-- Các ràng buộc cho bảng `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `category_banners`
--
ALTER TABLE `category_banners`
  ADD CONSTRAINT `fk_category_banners_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

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
-- Các ràng buộc cho bảng `size`
--
ALTER TABLE `size`
  ADD CONSTRAINT `fk_size_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `variant`
--
ALTER TABLE `variant`
  ADD CONSTRAINT `fk_variant_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
