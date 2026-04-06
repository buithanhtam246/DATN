const Cart = require('../model/Cart.model');
const CartItem = require('../model/CartItem.model');
const sequelize = require('../../config/database');

class CartService {
  // Lấy giỏ hàng của user
  async getUserCart(userId) {
    try {
      const cart = await Cart.findOne({
        where: { user_id: userId },
        include: [
          {
            model: CartItem,
            as: 'items'
          }
        ]
      });

      return cart;
    } catch (error) {
      throw error;
    }
  }

  // Tạo giỏ hàng mới
  async createNewCart(userId = null) {
    try {
      const cart = await Cart.create({
        user_id: userId,
        status: 1
      });

      return cart;
    } catch (error) {
      throw error;
    }
  }

  // Thêm sản phẩm vào giỏ
  async addProductToCart(cartId, variantId, quantity) {
    try {
      const existingItem = await CartItem.findOne({
        where: {
          cart_id: cartId,
          variant_id: variantId
        }
      });

      if (existingItem) {
        existingItem.quantity += quantity;
        return await existingItem.save();
      } else {
        return await CartItem.create({
          cart_id: cartId,
          variant_id: variantId,
          quantity: quantity
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật số lượng
  async updateQuantity(itemId, quantity) {
    try {
      const item = await CartItem.findByPk(itemId);
      if (!item) return null;

      item.quantity = quantity;
      return await item.save();
    } catch (error) {
      throw error;
    }
  }

  // Xóa sản phẩm khỏi giỏ
  async removeProduct(itemId) {
    try {
      return await CartItem.destroy({
        where: { id: itemId }
      });
    } catch (error) {
      throw error;
    }
  }

  // Xóa hết giỏ
  async clearCart(cartId) {
    try {
      return await CartItem.destroy({
        where: { cart_id: cartId }
      });
    } catch (error) {
      throw error;
    }
  }

  // Tính tổng giá
  async calculateTotal(cartId) {
    try {
      const result = await sequelize.sequelize.query(
        `SELECT SUM(ci.quantity * p.price) as total_price
         FROM cart_item ci
         LEFT JOIN variant v ON ci.variant_id = v.id
         LEFT JOIN products p ON v.product_id = p.id
         WHERE ci.cart_id = ?`,
        {
          replacements: [cartId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      return result[0]?.total_price || 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy chi tiết giỏ hàng
  async getCartDetails(cartId) {
    try {
      const items = await sequelize.sequelize.query(
        `SELECT ci.id, ci.cart_id, ci.variant_id, ci.quantity,
                v.product_id, p.name as product_name, p.image, p.price,
                (ci.quantity * p.price) as subtotal
         FROM cart_item ci
         LEFT JOIN variant v ON ci.variant_id = v.id
         LEFT JOIN products p ON v.product_id = p.id
         WHERE ci.cart_id = ?`,
        {
          replacements: [cartId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      return items;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CartService();
