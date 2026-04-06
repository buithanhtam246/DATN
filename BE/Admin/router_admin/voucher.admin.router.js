const express = require('express');
const router = express.Router();
const voucherAdminController = require('../controller_admin/voucher.admin.controller');

// Lấy tất cả voucher
router.get('/', voucherAdminController.getAllVouchers);

// Lấy chi tiết voucher
router.get('/:id', voucherAdminController.getVoucherDetail);

// Tạo voucher mới
router.post('/', voucherAdminController.createVoucher);

// Cập nhật voucher
router.put('/:id', voucherAdminController.updateVoucher);

// Xóa voucher
router.delete('/:id', voucherAdminController.deleteVoucher);

module.exports = router;