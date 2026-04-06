const express = require("express");
const router = express.Router();

const categoryController = require("../controller_admin/category.controller");

// Danh mục cấp 1 (Nam/Nữ)
router.get("/parents", categoryController.getParentCategories);

// Danh mục con
router.get("/children/:parentId", categoryController.getSubCategories);

// Tất cả danh mục (cấp 1 + cấp 2)
router.get("/", categoryController.getAllCategories);

// Tạo danh mục cấp 1
router.post("/parent", categoryController.createParentCategory);

// Tạo danh mục cấp 2
router.post("/child", categoryController.createSubCategory);

// Cập nhật danh mục
router.put("/:id", categoryController.updateCategory);

// Xóa danh mục
router.delete("/:id", categoryController.deleteCategory);

// Legacy routes
router.get("/:id", categoryController.getCategoryById);

module.exports = router;