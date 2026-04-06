const express = require('express');
const router = express.Router();
const orderController = require('../controller_admin/order.controller');

// Lấy tất cả đơn hàng
router.get('/', orderController.getAllOrders);

// Lấy chi tiết đơn hàng
router.get('/:id', orderController.getOrderDetail);

// Cập nhật trạng thái đơn hàng
router.put('/:id/status', orderController.updateOrderStatus);

// Xóa đơn hàng
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
