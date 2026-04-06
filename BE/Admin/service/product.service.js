const { PRODUCT_IMAGE_PATH } = require('../config/constants');
const productRepo = require('../repository/product.repository');
const productAdminRepo = require('../repository_admin/product.admin.repository');

class ProductService {
  async getAllProducts() {
    const products = await productRepo.getAllProducts();
    return products.map(p => ({
      ...p,
      image: PRODUCT_IMAGE_PATH + p.image,
    }));
  }

  async getProductDetail(productId) {
    const rows = await productRepo.getProductDetail(productId);
    if (!rows.length) return null;

    const product = {
      id: rows[0].productId,
      name: rows[0].name,
      description: rows[0].describ,
      image: PRODUCT_IMAGE_PATH + rows[0].productImage,
      brand: rows[0].brand,
      colors: [],
    };

    const colorMap = {};
    rows.forEach(row => {
      if (!colorMap[row.colorId]) {
        colorMap[row.colorId] = {
          colorId: row.colorId,
          colorCode: row.table_color,
          image: PRODUCT_IMAGE_PATH + row.image,
          sizes: [],
        };
        product.colors.push(colorMap[row.colorId]);
      }

      colorMap[row.colorId].sizes.push({
        sizeId: row.size_id,
        sizeName: row.bang_size,
        variantId: row.variantId,
        price: row.price,
        priceSale: row.price_sale,
        quantity: row.quantity,
      });
    });

    return product;
  }

  async getProductReviews(productId) {
    return productRepo.getProductReviews(productId);
  }

  async getRelatedProducts(productId) {
    const products = await productRepo.getRelatedProducts(productId);
    return products.map(p => ({
      ...p,
      image: PRODUCT_IMAGE_PATH + p.image,
    }));
  }

  async getProductsByBrand(brandId) {
    const products = await productRepo.getProductsByBrand(brandId);
    return products.map(p => ({
      ...p,
      image: PRODUCT_IMAGE_PATH + p.image,
    }));
  }

  async getProductsByCategory(categoryId) {
    const products = await productRepo.getProductsByCategory(categoryId);
    return products.map(p => ({
      ...p,
      image: PRODUCT_IMAGE_PATH + p.image,
    }));
  }

  async getNewProducts() {
    const products = await productRepo.getNewProducts();
    return products.map(p => ({
      ...p,
      image: PRODUCT_IMAGE_PATH + p.image,
    }));
  }

  async getBestSellingProducts() {
    const products = await productRepo.getBestSellingProducts();
    return products.map(p => ({
      ...p,
      image: PRODUCT_IMAGE_PATH + p.image,
    }));
  }

  async createProduct(data) {
    return productRepo.createProduct(data);
  }

  async generateVariants(productId, colors, sizes) {
    await productRepo.generateVariants(productId, colors, sizes);
  }

  async updateVariant(variantId, data) {
    await productRepo.updateVariant(variantId, data);
  }

  // ==================== ADMIN METHODS ====================

  // Get all products with variants for admin
  async getAllProductsAdmin() {
    try {
      const products = await productRepo.getAllProductsAdminList();
      
      const result = [];
      for (const product of products) {
        const variants = await productRepo.getVariantsByProductId(product.id);
        result.push({
          id: product.id,
          name: product.name,
          brand: product.brand || 'N/A',
          category: product.category || 'N/A',
          price: product.price || 0,
          description: product.description || '',
          status: product.status || 1,
          variants: variants.map(v => ({
            id: v.id,
            productId: v.product_id,
            name: v.name,
            color: v.color || '#000000',
            size: v.size || '',
            stock: v.stock || 0,
            image: v.image || ''
          }))
        });
      }
      
      return result;
    } catch (err) {
      throw err;
    }
  }

  // Get product by ID with all variants
  async getProductByIdAdmin(productId) {
    try {
      const product = await productRepo.getProductByIdAdmin(productId);
      if (!product) return null;

      const variants = await productRepo.getVariantsByProductId(productId);

      return {
        id: product.id,
        name: product.name,
        brand: product.brand || 'N/A',
        category: product.category || 'N/A',
        price: product.price || 0,
        description: product.description || '',
        status: product.status || 1,
        variants: variants.map(v => ({
          id: v.id,
          productId: v.product_id,
          colorId: v.color_id,
          sizeId: v.size_id,
          price: v.price,
          priceSale: v.price_sale,
          quantity: v.quantity,
          image: v.image || '',
          colorName: v.color_name || 'Unknown Color',
          colorCode: v.color_code || '#000000',
          sizeName: v.size_name || ''
        }))
      };
    } catch (err) {
      throw err;
    }
  }

  // Create product for admin
  async createProductAdmin(data) {
    try {
      const result = await productRepo.createProductAdmin(data);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // Update product for admin
  async updateProductAdmin(productId, data) {
    try {
      await productRepo.updateProductAdmin(productId, data);
    } catch (err) {
      throw err;
    }
  }

  // Delete product for admin
  async deleteProductAdmin(productId) {
    try {
      await productRepo.deleteProductAdmin(productId);
    } catch (err) {
      throw err;
    }
  }

  // Add variant for admin
  async addVariantAdmin(productId, data) {
    try {
      const result = await productRepo.createVariantAdmin(productId, data);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // Update variant for admin
  async updateVariantAdmin(variantId, data) {
    try {
      await productRepo.updateVariantAdmin(variantId, data);
    } catch (err) {
      throw err;
    }
  }

  // Delete variant for admin
  async deleteVariantAdmin(variantId) {
    try {
      await productRepo.deleteVariantAdmin(variantId);
    } catch (err) {
      throw err;
    }
  }

  // ==================== NEW: VARIANT + IMAGE METHODS ====================

  /**
   * Create product with multiple variants (each has different price)
   */
  async createProductWithVariantsAdmin(data) {
    const productVariantService = require('./productVariant.service');
    return productVariantService.createProductWithVariants(data);
  }

  /**
   * Add image to variant
   */
  async addImageToVariantAdmin(variantId, imageUrl, isPrimary = false) {
    const productVariantService = require('./productVariant.service');
    return productVariantService.addImageToVariant(variantId, imageUrl, isPrimary);
  }

  /**
   * Get product with all variants and their images
   */
  async getProductWithVariantsAndImagesAdmin(productId) {
    const productVariantService = require('./productVariant.service');
    return productVariantService.getProductWithVariantsAndImages(productId);
  }

  /**
   * Delete image from variant
   */
  async deleteImageFromVariantAdmin(imageId) {
    const productVariantService = require('./productVariant.service');
    return productVariantService.deleteImageFromVariant(imageId);
  }
}

module.exports = new ProductService();