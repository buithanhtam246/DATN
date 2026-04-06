const express = require('express');
const router = express.Router();

const adminAuthController = require('../controller_admin/admin-auth.controller');
const { adminAuthMiddleware, adminLoginRateLimiter } = require('../middleware_admin/admin-auth.middleware');

/**
 * Admin Auth Routes
 * Endpoint riêng cho admin login với bảo mật cao hơn
 */

// Đăng nhập admin (với rate limiting)
router.post('/login', adminLoginRateLimiter, adminAuthController.login);

// Xác nhận token admin
router.post('/verify', adminAuthMiddleware, adminAuthController.verify);

// Đăng xuất admin
router.post('/logout', adminAuthMiddleware, adminAuthController.logout);

module.exports = router;
