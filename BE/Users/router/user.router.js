const express = require('express');
const router = express.Router();

const userController = require('../controller/user.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Lấy tất cả users (yêu cầu admin) - TRƯỚC middleware
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers.bind(userController));

// Lấy thông tin tài khoản (không có địa chỉ)
router.get('/profile', authMiddleware, userController.getProfile.bind(userController));

// Lấy thông tin tài khoản kèm địa chỉ mặc định
router.get('/profile-with-address', authMiddleware, userController.getProfileWithDefaultAddress.bind(userController));

// Cập nhật thông tin tài khoản
router.put('/profile', authMiddleware, userController.updateProfile.bind(userController));

module.exports = router;