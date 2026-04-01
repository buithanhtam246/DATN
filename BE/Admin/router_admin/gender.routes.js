const express = require('express');
const router = express.Router();
const genderController = require('../controller_admin/gender.controller');

// Lấy tất cả giới tính
router.get('/', genderController.getAllGenders);

// Lấy giới tính theo ID
router.get('/:id', genderController.getGenderById);

// Thêm giới tính mới
router.post('/', genderController.createGender);

// Cập nhật giới tính
router.put('/:id', genderController.updateGender);

// Xóa giới tính
router.delete('/:id', genderController.deleteGender);

module.exports = router;
