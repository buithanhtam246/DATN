const express = require("express");
const router = express.Router();
const brandController = require("../controller_admin/brand.controller"); 

// Đường dẫn đầy đủ: GET http://localhost:3000/api/admin/brands
router.get("/", brandController.getAllBrands);

// POST: Thêm brand mới
// Đường dẫn: POST http://localhost:3000/api/admin/brands
router.post("/", brandController.createBrand);

// PUT: Cập nhật brand theo ID
// Đường dẫn: PUT http://localhost:3000/api/admin/brands/:id
router.put("/:id", brandController.updateBrand);

// DELETE: Xóa brand theo ID
// Đường dẫn: DELETE http://localhost:3000/api/admin/brands/:id
router.delete("/:id", brandController.deleteBrand);

module.exports = router;