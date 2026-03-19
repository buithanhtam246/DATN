const express = require('express');
const router = express.Router();
const cartController = require('../controller/cart.controller');

// Tất cả route không cần authentication
// Tạo giỏ hàng mới
router.post('/create', cartController.createCart);

// Lấy giỏ hàng
router.get('/', cartController.getCart);

// Thêm sản phẩm vào giỏ
router.post('/add', cartController.addToCart);

// Cập nhật số lượng sản phẩm
router.put('/update/:itemId', cartController.updateCartItem);

// Xóa sản phẩm khỏi giỏ
router.delete('/remove/:itemId', cartController.removeFromCart);

// Xóa hết giỏ hàng
router.delete('/clear', cartController.clearCart);

// Lấy tổng giá giỏ hàng
router.get('/total', cartController.getCartTotal);

module.exports = router;
