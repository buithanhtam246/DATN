const { PRODUCT_IMAGE_PATH } = require('../config/constants');
const productRepo = require('../repository/product.repository');

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
}

module.exports = new ProductService();