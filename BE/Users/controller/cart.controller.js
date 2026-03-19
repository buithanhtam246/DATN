const Cart = require('../model/Cart.model');
const CartItem = require('../model/CartItem.model');
const sequelize = require('../../config/database');

class CartController {
  // Lấy giỏ hàng (không cần đăng nhập)
  async getCart(req, res) {
    try {
      const cartId = req.query.cart_id || req.body.cart_id;

      if (!cartId) {
        return res.status(400).json({
          success: false,
          message: 'cart_id is required'
        });
      }

      const cart = await Cart.findByPk(cartId, {
        include: [
          {
            model: CartItem,
            as: 'items'
          }
        ]
      });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      // Lấy thông tin chi tiết sản phẩm từ database
      const cartItems = await sequelize.sequelize.query(
        `SELECT ci.id, ci.cart_id, ci.variant_id, ci.quantity,
                v.id as variant_id, v.product_id, p.name as product_name,
                COALESCE(p.image, v.image) as image,
                v.price as original_price
         FROM cart_item ci
         LEFT JOIN variant v ON ci.variant_id = v.id
         LEFT JOIN products p ON v.product_id = p.id
         WHERE ci.cart_id = ?`,
        {
          replacements: [cartId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      return res.status(200).json({
        success: true,
        data: {
          cart_id: cartId,
          items: cartItems,
          total_items: cartItems.length
        }
      });
    } catch (error) {
      console.error('Error in getCart:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Tạo giỏ hàng mới (không cần đăng nhập)
  async createCart(req, res) {
    try {
      const { user_id } = req.body;

      const cart = await Cart.create({
        user_id: user_id || null, // user_id optional
        status: 1
      });

      return res.status(201).json({
        success: true,
        message: 'Cart created successfully',
        data: {
          cart_id: cart.id,
          user_id: cart.user_id,
          status: cart.status
        }
      });
    } catch (error) {
      console.error('Error in createCart:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Thêm sản phẩm vào giỏ hàng (không cần đăng nhập)
  async addToCart(req, res) {
    try {
      const { cart_id, variant_id, quantity } = req.body;

      if (!cart_id || !variant_id || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: cart_id, variant_id, quantity'
        });
      }

      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be at least 1'
        });
      }

      // Kiểm tra cart có tồn tại
      const cart = await Cart.findByPk(cart_id);
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      // Kiểm tra variant có tồn tại
      const variant = await sequelize.sequelize.query(
        `SELECT id, product_id FROM variant WHERE id = ?`,
        {
          replacements: [variant_id],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      if (variant.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Variant not found'
        });
      }

      // Kiểm tra sản phẩm đã có trong giỏ chưa
      const existingItem = await CartItem.findOne({
        where: {
          cart_id: cart_id,
          variant_id: variant_id
        }
      });

      let cartItem;
      if (existingItem) {
        // Nếu có rồi thì cập nhật số lượng
        existingItem.quantity += quantity;
        cartItem = await existingItem.save();
      } else {
        // Nếu chưa có thì tạo mới
        cartItem = await CartItem.create({
          cart_id: cart_id,
          variant_id: variant_id,
          quantity: quantity
        });
      }

      // Fetch detailed info for the single item (including product/variant details)
      const [detailed] = await sequelize.sequelize.query(
        `SELECT ci.id, ci.cart_id, ci.variant_id, ci.quantity,
                v.id as variant_id, v.product_id, p.name as product_name,
                COALESCE(p.image, v.image) as image,
                v.price as original_price
         FROM cart_item ci
         LEFT JOIN variant v ON ci.variant_id = v.id
         LEFT JOIN products p ON v.product_id = p.id
         WHERE ci.id = ?`,
        {
          replacements: [cartItem.id],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      return res.status(201).json({
        success: true,
        message: 'Product added to cart successfully',
        data: detailed || {
          item_id: cartItem.id,
          cart_id: cartItem.cart_id,
          variant_id: cartItem.variant_id,
          quantity: cartItem.quantity
        }
      });
    } catch (error) {
      console.error('Error in addToCart:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cập nhật số lượng sản phẩm trong giỏ
  async updateCartItem(req, res) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (!quantity) {
        return res.status(400).json({
          success: false,
          message: 'quantity is required'
        });
      }

      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be at least 1'
        });
      }

      const cartItem = await CartItem.findByPk(itemId);
      if (!cartItem) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      cartItem.quantity = quantity;
      await cartItem.save();

      return res.status(200).json({
        success: true,
        message: 'Cart item updated successfully',
        data: {
          item_id: cartItem.id,
          quantity: cartItem.quantity
        }
      });
    } catch (error) {
      console.error('Error in updateCartItem:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  async removeFromCart(req, res) {
    try {
      const { itemId } = req.params;

      const cartItem = await CartItem.findByPk(itemId);
      if (!cartItem) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      await cartItem.destroy();

      return res.status(200).json({
        success: true,
        message: 'Product removed from cart successfully'
      });
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Xóa toàn bộ giỏ hàng
  async clearCart(req, res) {
    try {
      const { cart_id } = req.body;

      if (!cart_id) {
        return res.status(400).json({
          success: false,
          message: 'cart_id is required'
        });
      }

      const cart = await Cart.findByPk(cart_id);
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
      }

      // Xóa tất cả items trong giỏ
      await CartItem.destroy({
        where: { cart_id: cart_id }
      });

      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      console.error('Error in clearCart:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Tính tổng giá giỏ hàng
  async getCartTotal(req, res) {
    try {
      const { cart_id } = req.query;

      if (!cart_id) {
        return res.status(400).json({
          success: false,
          message: 'cart_id is required'
        });
      }

      const total = await sequelize.sequelize.query(
        `SELECT SUM(ci.quantity * p.price) as total_price
         FROM cart_item ci
         LEFT JOIN variants v ON ci.variant_id = v.id
         LEFT JOIN products p ON v.product_id = p.id
         WHERE ci.cart_id = ?`,
        {
          replacements: [cart_id],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      return res.status(200).json({
        success: true,
        data: {
          cart_id: cart_id,
          total_price: total[0]?.total_price || 0
        }
      });
    } catch (error) {
      console.error('Error in getCartTotal:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new CartController();
