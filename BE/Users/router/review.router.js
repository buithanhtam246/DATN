const express = require('express');
const router = express.Router();
const reviewController = require('../controller/review.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Tạo đánh giá (require authentication)
router.post('/create', authMiddleware, reviewController.create.bind(reviewController));

// Lấy đánh giá của một sản phẩm (public - không cần auth)
router.get('/product', reviewController.getProductReviews.bind(reviewController));

// Lấy đánh giá của một đơn hàng (require authentication)
router.get('/order/:order_id', authMiddleware, reviewController.getOrderReviews.bind(reviewController));

// Cập nhật đánh giá (require authentication)
router.put('/update/:review_id', authMiddleware, reviewController.update.bind(reviewController));

// Xóa đánh giá (require authentication)
router.delete('/delete/:review_id', authMiddleware, reviewController.delete.bind(reviewController));

module.exports = router;
