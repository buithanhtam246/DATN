const express = require('express');
const router = express.Router();
const paymentController = require('../controller/payment.controller');

router.post('/vnpay/create', paymentController.createVnpayUrl);
router.get('/vnpay/return', paymentController.vnpayReturn);
router.post('/vnpay/ipn', paymentController.vnpayIpn);
// MoMo routes
router.post('/momo/create', paymentController.createMomoUrl);
router.get('/momo/return', paymentController.momoReturn);
router.post('/momo/notify', paymentController.momoNotify);
// Test redirect endpoint (server will create MoMo request then redirect browser to payUrl)
router.get('/momo/redirect', paymentController.momoRedirect);

module.exports = router;