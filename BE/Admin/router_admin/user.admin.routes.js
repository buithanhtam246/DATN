const express = require('express');
const router = express.Router();
const userController = require('../controller_admin/user.controller');

// Lấy tất cả người dùng
router.get('/', userController.getAllUsers);

// Lấy chi tiết người dùng
router.get('/:id', userController.getUserDetail);

// Cập nhật người dùng
router.put('/:id', userController.updateUser);

// Xóa người dùng
router.delete('/:id', userController.deleteUser);

module.exports = router;
