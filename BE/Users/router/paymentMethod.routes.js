const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controller/PaymentMethod.controller');

// Lấy tất cả phương thức thanh toán (không cần auth)
router.get('/all', paymentMethodController.getAll);

module.exports = router;
