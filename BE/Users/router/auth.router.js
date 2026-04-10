const express = require('express');
const router = express.Router();

const authController = require('../controller/auth.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin, validateResetWithCode, validateForgot, validateReset } = require('../middleware/validate.middleware');

// Đăng ký
router.post('/register', validateRegister, authController.register);
// Đăng ký admin (chỉ admin hiện tại mới tạo được)
router.post('/register-admin', authMiddleware, adminMiddleware, validateRegister, authController.registerAdmin);

// Đăng nhập
router.post('/login', validateLogin, authController.login);

// Login / Register with Google (id_token)
router.post('/google', authController.googleLogin);

// Đăng nhập admin (endpoint riêng cho admin)
router.post('/admin-login', validateLogin, authController.adminLogin);

// Quên mật khẩu
router.post('/forgot-password', validateForgot, authController.forgotPassword);
// Quên mật khẩu (token/link version)
router.post('/forgot-password-token', validateForgot, authController.forgotPasswordToken);
// Request reset code (sends numeric code)
router.post('/request-reset-code', validateForgot, authController.requestResetCode);

// Đặt lại mật khẩu bằng token (link) - khôi phục theo yêu cầu
router.post('/reset-password', validateReset, authController.resetPassword);

// Đặt lại mật khẩu bằng mã (OTP)
router.post('/reset-password-with-code', validateResetWithCode, authController.resetWithCode);
// Xác nhận mã OTP
router.post('/verify-reset-code', authController.verifyResetCode);
// Gửi mail thử nghiệm (body: { to: 'email@example.com' })
router.post('/test-email', authController.testEmail);

// Đổi mật khẩu (yêu cầu đăng nhập)
router.post('/change-password', authMiddleware, authController.changePassword);

// Admin logout
router.post('/admin-logout', authMiddleware, authController.adminLogout);

module.exports = router;