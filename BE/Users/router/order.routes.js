const express = require('express');
const router = express.Router();
const orderController = require('../controller/Order.controller');
const { authMiddleware } = require('../middleware/auth.middleware'); // Middleware kiểm tra đăng nhập

// Route lấy tất cả đơn hàng (cho admin) - phải đặt trước /:id
router.get('/list/all', authMiddleware, orderController.getAllOrders);

// Route đặt hàng (Cần đăng nhập)
router.post('/checkout', authMiddleware, orderController.create);

// Route xem chi tiết đơn hàng
router.get('/:id', authMiddleware, orderController.getOrderDetails);

// Route cập nhật trạng thái đơn hàng
router.patch('/:id/status', authMiddleware, orderController.updateStatus);

// Bạn có thể thêm route lấy lịch sử đơn hàng ở đây
// router.get('/history', authMiddleware, orderController.list);

module.exports = router;