const express = require('express');
const router = express.Router();
const colorController = require('../controller_admin/color.controller');

// Lấy tất cả màu sắc
router.get('/', colorController.getColors);

// Thêm màu sắc mới
router.post('/', colorController.addColor);

// Cập nhật màu sắc
router.put('/:id', colorController.updateColor);

// Xóa màu sắc
router.delete('/:id', colorController.deleteColor);

module.exports = router;
