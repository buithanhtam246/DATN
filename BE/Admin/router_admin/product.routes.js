const express = require('express');
const router = express.Router();
const upload = require('../middleware_admin/upload.middleware');
const productController = require('../controller_admin/product.controller');

// Debug middleware - log incoming request
router.post('/add-product', (req, res, next) => {
    console.log('\n🔵 [ADD-PRODUCT] Incoming request');
    console.log('  - Content-Type:', req.get('content-type'));
    next();
});

// Dòng 8: Đảm bảo productController.getAllProducts không bị undefined
router.get('/all-products', productController.getAllProducts);

// Route lấy chi tiết sản phẩm theo ID
router.get('/products/:id', productController.getProductDetail);

// Route thêm sản phẩm
router.post('/add-product', upload.any(), (req, res, next) => {
    console.log('🟢 [MULTER] After upload.any()');
    console.log('  - req.files count:', req.files ? req.files.length : 0);
    if (req.files) {
        req.files.forEach(f => {
            console.log(`    • ${f.fieldname}: ${f.filename} (${f.size} bytes)`);
        });
    }
    console.log('  - req.body keys:', Object.keys(req.body));
    next();
}, productController.createFullProduct);

// Route cập nhật sản phẩm
router.put('/products/:id', upload.any(), productController.updateProduct);

// Route xóa sản phẩm
router.delete('/products/:id', productController.deleteProduct);

module.exports = router;