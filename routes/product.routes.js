const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");

router.get("/", productController.getAllProducts);

router.get("/new", productController.getNewProducts);

router.get("/best-sell", productController.getBestSellingProducts);

router.get("/brand/:brandId", productController.getProductsByBrand);

router.get("/category/:categoryId", productController.getProductsByCategory);

router.get("/:id/reviews", productController.getProductReviews);

router.get("/:id/related", productController.getRelatedProducts);   

router.post("/", productController.createProduct);

router.post("/generate-variants", productController.generateVariants);

router.put("/variants/:id", productController.updateVariant);

router.get("/:id", productController.getProductDetail);             

module.exports = router;