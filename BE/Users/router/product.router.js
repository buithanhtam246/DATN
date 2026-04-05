const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');

// Tìm kiếm sản phẩm (công khai) - PHẢI ĐẶT TRƯỚC /:id
router.get('/search', productController.searchProducts.bind(productController));

// Lấy tồn kho cho nhiều variants
router.post('/inventory', productController.getVariantsInventory.bind(productController));

// Lấy tất cả sản phẩm (công khai - không cần đăng nhập)
router.get('/', productController.getAllProducts.bind(productController));

// Lấy chi tiết sản phẩm theo ID (công khai)
router.get('/:id', productController.getProductById.bind(productController));

module.exports = router;
