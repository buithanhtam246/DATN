const express = require('express');
const router = express.Router();
const newsController = require('../controller_admin/news.controller');
const upload = require('../middleware_admin/upload.middleware');

router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsDetail);
router.post('/', newsController.createNews);
// Upload image for news (single file field name: 'image')
router.post('/upload', upload.single('image'), newsController.uploadImage);
router.put('/:id', newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

module.exports = router;
