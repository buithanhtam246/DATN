const express = require('express');
const router = express.Router();
const orderHistoryController = require('../controller/OrderHistory.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Middleware kiểm tra đăng nhập cho tất cả route
router.use(authMiddleware);

// Lấy lịch sử đơn hàng
router.get('/history', orderHistoryController.getOrderHistory);

// Lấy chi tiết đơn hàng
router.get('/history/:id', orderHistoryController.getOrderDetail);

// Lấy timeline/lịch sử trạng thái đơn hàng
router.get('/history/:id/timeline', orderHistoryController.getOrderTimeline);

// Thêm review cho đơn hàng
router.post('/review', orderHistoryController.addReview);

// Cập nhật review
router.put('/review/:reviewId', orderHistoryController.updateReview);

// Lấy reviews của đơn hàng
router.get('/reviews/order/:orderId', orderHistoryController.getOrderReviews);

// Cập nhật trạng thái đơn hàng (chỉ cho testing)
router.put('/history/:id/status', orderHistoryController.updateOrderStatus);

module.exports = router;
