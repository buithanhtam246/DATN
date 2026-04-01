const express = require('express');
const router = express.Router();
const colorSizeController = require('../controller_admin/color-size.controller');

// ========== COLOR ROUTES ==========

// Lấy tất cả màu sắc
router.get('/colors', colorSizeController.getColors);

// Thêm màu sắc mới
router.post('/colors', colorSizeController.addColor);

// Cập nhật màu sắc
router.put('/colors/:id', colorSizeController.updateColor);

// Xóa màu sắc
router.delete('/colors/:id', colorSizeController.deleteColor);


// ========== SIZE ROUTES ==========

// Lấy tất cả kích thước
router.get('/sizes', colorSizeController.getSizes);

// Thêm kích thước mới
router.post('/sizes', colorSizeController.addSize);

// Cập nhật kích thước
router.put('/sizes/:id', colorSizeController.updateSize);

// Xóa kích thước
router.delete('/sizes/:id', colorSizeController.deleteSize);

module.exports = router;
