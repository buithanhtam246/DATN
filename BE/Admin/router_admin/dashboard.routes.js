const express = require('express');
const router = express.Router();
const dashboardController = require('../controller_admin/dashboard.controller');

// Lấy top products bán chạy nhất
router.get('/top-selling-products', dashboardController.getTopSellingProducts);

// Lấy dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// Lấy đơn hàng gần đây
router.get('/recent-orders', dashboardController.getRecentOrders);

module.exports = router;
