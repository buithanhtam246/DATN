const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");

router.get("/", productController.getAllProducts);

router.get("/:id", productController.getProductDetail);

router.get("/:id/reviews", productController.getProductReviews);

router.get("/brand/:brandId", productController.getProductsByBrand);

router.get("/category/:categoryId", productController.getProductsByCategory);

module.exports = router;