const express = require('express');
const router = express.Router();
const paymentController = require('../controller/payment.controller');

router.post('/vnpay/create', paymentController.createVnpayUrl);
router.get('/vnpay/return', paymentController.vnpayReturn);
router.post('/vnpay/ipn', paymentController.vnpayIpn);

module.exports = router;
