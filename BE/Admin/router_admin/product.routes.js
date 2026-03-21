const express = require("express");
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		const timestamp = Date.now();
		const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
		cb(null, `${timestamp}-${safeName}`);
	}
});

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const productController = require("../controller_admin/product.controller");

router.get("/", productController.getAllProducts);

router.get("/new", productController.getNewProducts);

router.get("/best-sell", productController.getBestSellingProducts);

router.get("/brand/:brandId", productController.getProductsByBrand);

router.get("/category/:categoryId", productController.getProductsByCategory);

router.get("/:id/reviews", productController.getProductReviews);

// router.get("/:id/related", productController.getRelatedProducts);   

router.post("/", upload.single('image'), productController.createProduct);

router.post("/generate-variants", productController.generateVariants);

router.put("/variants/:id", productController.updateVariant);

router.get("/:id", productController.getProductDetail);             

module.exports = router;