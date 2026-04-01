const express = require('express');
const router = express.Router();
const voucherController = require('../controller/voucher.controller');

// Lấy danh sách voucher có sẵn
router.get('/available', voucherController.getAvailable);

// Kiểm tra voucher và tính discount
router.post('/check', voucherController.checkVoucher);

// Lấy chi tiết voucher
router.get('/detail/:code', voucherController.getDetail);

// Tạo voucher mới
router.post('/', voucherController.create);

// xóa voucher
router.delete('/:id', voucherController.deleteVoucher);

module.exports = router;
