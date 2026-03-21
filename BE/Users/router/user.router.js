const express = require('express');
const router = express.Router();

const userController = require('../controller/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Tất cả endpoint đều yêu cầu xác thực
router.use(authMiddleware);

// Lấy thông tin tài khoản (không có địa chỉ)
router.get('/profile', userController.getProfile.bind(userController));

// Lấy thông tin tài khoản kèm địa chỉ mặc định
router.get('/profile-with-address', userController.getProfileWithDefaultAddress.bind(userController));

// Cập nhật thông tin tài khoản
router.put('/profile', userController.updateProfile.bind(userController));

module.exports = router;