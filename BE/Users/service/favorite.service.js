const Favorite = require('../model/Favorite.model');
const { sequelize } = require('../../config/database');
const Product = sequelize.models.Product;

class FavoriteService {
  async addFavorite(userId, productId) {
    // Check existence
    const exists = await Favorite.findOne({ where: { user_id: userId, product_id: productId } });
    if (exists) {
      return { success: true, message: 'Sản phẩm đã có trong yêu thích', data: exists };
    }

    const fav = await Favorite.create({ user_id: userId, product_id: productId });
    return { success: true, message: 'Thêm vào yêu thích thành công', data: fav };
  }

  async removeFavorite(userId, productId) {
    const deleted = await Favorite.destroy({ where: { user_id: userId, product_id: productId } });
    if (deleted) return { success: true, message: 'Xóa khỏi yêu thích thành công' };
    return { success: false, message: 'Không tìm thấy mục yêu thích' };
  }

  async listFavorites(userId) {
    const rows = await Favorite.findAll({ where: { user_id: userId } });
    const productIds = rows.map(r => r.product_id);
    // Optionally fetch product details if Product model exists
    let products = [];
    try {
      if (productIds.length) {
        products = await Product.findAll({ where: { id: productIds } });
      }
    } catch (e) {
      products = [];
    }

    return { success: true, message: 'Lấy danh sách yêu thích thành công', data: { favorites: rows, products } };
  }
}

module.exports = new FavoriteService();
