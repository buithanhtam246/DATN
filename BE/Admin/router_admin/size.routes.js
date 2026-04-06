const express = require('express');
const router = express.Router();
const sizeController = require('../controller_admin/size.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/size-guides/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Config upload ảnh hướng dẫn size
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'size-guide-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh JPG, PNG, WebP'));
    }
  }
});

// ===== SIZE ENDPOINTS =====

// Lấy tất cả kích thước
router.get('/', sizeController.getSizes);

// Lấy tất cả hình ảnh hướng dẫn size
router.get('/guides/all', sizeController.getAllSizeGuides);

// Lấy hình ảnh hướng dẫn size theo gender
router.get('/guide/:gender', sizeController.getSizeGuideByGender);

// Thêm kích thước mới
router.post('/', sizeController.addSize);

// Upload hình ảnh hướng dẫn size cho nam/nữ
router.post('/guide/:gender/upload', upload.single('image'), sizeController.uploadSizeGuide);

// Xóa hình ảnh hướng dẫn size theo gender
router.delete('/guide/:gender', sizeController.deleteSizeGuide);

// Cập nhật kích thước
router.put('/:id', sizeController.updateSize);

// Xóa kích thước
router.delete('/:id', sizeController.deleteSize);

// ===== CATEGORY SIZE GUIDE ENDPOINTS =====

// Lấy sizes theo category
router.get('/category/:categoryId/sizes', sizeController.getSizesByCategory);

// Lấy ảnh hướng dẫn size theo category
router.get('/category/:categoryId/guide', sizeController.getSizeGuideByCategory);

// Upload ảnh hướng dẫn size cho category
router.post('/category/:categoryId/upload', upload.single('image'), sizeController.uploadSizeGuideByCategory);

// Xóa ảnh hướng dẫn size của category
router.delete('/category/:categoryId/guide', sizeController.deleteSizeGuideByCategory);

module.exports = router;
