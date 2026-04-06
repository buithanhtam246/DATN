const productRepo = require('../repository/product.repository');

class ProductService {
  async getAllProducts() {
    try {
      return await productRepo.findAll();
    } catch (error) {
      throw new Error('Lỗi lấy danh sách sản phẩm: ' + error.message);
    }
  }

  async getProductById(id) {
    try {
      const product = await productRepo.findById(id);
      if (!product) {
        throw new Error('Sản phẩm không tồn tại');
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  async searchProducts(filters) {
    try {
      return await productRepo.search(filters);
    } catch (error) {
      throw new Error('Lỗi tìm kiếm sản phẩm: ' + error.message);
    }
  }
}

module.exports = new ProductService();
