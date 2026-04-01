const express = require('express');
const router = express.Router();
const upload = require('../middleware_admin/upload.middleware');
const productController = require('../controller_admin/product.controller');

// Dòng 8: Đảm bảo productController.getAllProducts không bị undefined
router.get('/all-products', productController.getAllProducts);

// Route thêm sản phẩm
router.post('/add-product', upload.array('images', 10), productController.createFullProduct);

// Route cập nhật sản phẩm
router.put('/products/:id', upload.array('images', 10), productController.updateProduct);

// Route xóa sản phẩm
router.delete('/products/:id', productController.deleteProduct);

module.exports = router;