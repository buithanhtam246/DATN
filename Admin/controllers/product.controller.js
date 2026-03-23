const productService = require('../services/product.service');

class ProductController {
  async getAllProducts(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.json({ success: true, data: products });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getProductDetail(req, res) {
    try {
      const product = await productService.getProductDetail(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, data: product });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getProductReviews(req, res) {
    try {
      const reviews = await productService.getProductReviews(req.params.id);
      res.json({ success: true, data: reviews });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getRelatedProducts(req, res) {
    try {
      const products = await productService.getRelatedProducts(req.params.id);
      res.json({ success: true, data: products });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getProductsByBrand(req, res) {
    try {
      const brandId = req.params.brandId;
      const products = await productService.getProductsByBrand(brandId);
      res.json({
        success: true,
        data: products
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async getProductsByCategory(req, res) {
    try {
      const categoryId = req.params.categoryId;
      const products = await productService.getProductsByCategory(categoryId);
      res.json({
        success: true,
        data: products
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async getNewProducts(req, res) {
    try {
      const products = await productService.getNewProducts();
      res.json({
        success: true,
        data: products
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async getBestSellingProducts(req, res) {
    try {
      const products = await productService.getBestSellingProducts();
      res.json({
        success: true,
        data: products
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async createProduct(req, res) {
    try {
      const productId = await productService.createProduct(req.body);
      res.json({ success: true, productId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async generateVariants(req, res) {
    try {
      const { productId, colors, sizes } = req.body;
      await productService.generateVariants(productId, colors, sizes);
      res.json({ success: true, message: 'Variants created' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updateVariant(req, res) {
    try {
      await productService.updateVariant(req.params.id, req.body);
      res.json({ success: true, message: 'Variant updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = new ProductController();