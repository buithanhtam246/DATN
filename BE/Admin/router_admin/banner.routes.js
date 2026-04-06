const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bannerController = require('../controller_admin/banner.controller');

const uploadDir = path.join(__dirname, '../../uploads/category-banners');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `category-banner-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    return cb(new Error('Chỉ chấp nhận file JPG/PNG/WebP'));
  }
});

router.get('/categories', bannerController.getCategoryBanners);
router.post('/categories', upload.single('image'), bannerController.createCategoryBanner);
router.put('/categories/:id', upload.single('image'), bannerController.updateCategoryBanner);
router.delete('/categories/:id', bannerController.deleteCategoryBanner);

router.get('/sports', bannerController.getSportBanners);
router.post('/sports', upload.single('image'), bannerController.createSportBanner);
router.put('/sports/:id', upload.single('image'), bannerController.updateSportBanner);
router.delete('/sports/:id', bannerController.deleteSportBanner);

module.exports = router;
