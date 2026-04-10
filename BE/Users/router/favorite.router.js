const express = require('express');
const router = express.Router();
const favoriteController = require('../controller/favorite.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Tạo yêu thích
router.post('/create', authMiddleware, favoriteController.create.bind(favoriteController));

// Xóa yêu thích theo product_id
router.delete('/:product_id', authMiddleware, favoriteController.remove.bind(favoriteController));

// Lấy danh sách yêu thích của user
router.get('/', authMiddleware, favoriteController.list.bind(favoriteController));

module.exports = router;
