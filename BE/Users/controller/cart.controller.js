const Cart = require('../model/Cart.model');
const CartItem = require('../model/CartItem.model');
const sequelize = require('../../config/database');

class CartController {
  constructor() {
    this.getCart = this.getCart.bind(this);
    this.createCart = this.createCart.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.updateCartItem = this.updateCartItem.bind(this);
    this.removeFromCart = this.removeFromCart.bind(this);
    this.clearCart = this.clearCart.bind(this);
    this.getCartTotal = this.getCartTotal.bind(this);
    this.restoreInventory = this.restoreInventory.bind(this);
  }

  async _getOrCreateUserCart(userId) {
    let cart = await Cart.findOne({
      where: { user_id: userId },
      order: [['id', 'DESC']]
    });

    if (!cart) {
      cart = await Cart.create({
        user_id: userId,
        status: 1
      });
    }

    return cart;
  }

  async _resolveCartContext(req) {
    const userId = req.user?.id ? Number(req.user.id) : null;

    if (userId) {
      const cart = await this._getOrCreateUserCart(userId);
      return { mode: 'user', userId, cart };
    }

    const cartId = req.query.cart_id || req.body.cart_id;
    if (!cartId) {
      return { mode: 'guest', error: { status: 400, message: 'cart_id is required' } };
    }

    const cart = await Cart.findByPk(cartId);
    if (!cart) {
      return { mode: 'guest', error: { status: 404, message: 'Cart not found' } };
    }

    // Không cho guest truy cập cart của user đã đăng nhập
    if (cart.user_id) {
      return { mode: 'guest', error: { status: 403, message: 'Cart belongs to a user. Please login.' } };
    }

    return { mode: 'guest', userId: null, cart };
  }

  // Lấy giỏ hàng (không cần đăng nhập)
  async getCart(req, res) {
    try {
      const ctx = await this._resolveCartContext(req);
      if (ctx.error) {
        return res.status(ctx.error.status).json({ success: false, message: ctx.error.message });
      }

      const cartId = ctx.cart.id;

      // Lấy thông tin chi tiết sản phẩm từ database
      const cartItems = await sequelize.sequelize.query(
        `SELECT ci.id, ci.cart_id, ci.variant_id, ci.quantity,
                v.id as variant_id, v.product_id, v.color_id, v.size_id,
                p.name as product_name, p.image as product_image,
                COALESCE(v.image, p.image) as image,
                c.name as color, s.size,
                v.price as original_price, v.price_sale as priceSale
         FROM cart_item ci
         LEFT JOIN variant v ON ci.variant_id = v.id
         LEFT JOIN products p ON v.product_id = p.id
         LEFT JOIN color c ON v.color_id = c.id
         LEFT JOIN size s ON v.size_id = s.id
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
      // Nếu đã đăng nhập: chỉ tạo/lấy cart theo token
      if (req.user?.id) {
        const cart = await this._getOrCreateUserCart(Number(req.user.id));
        return res.status(200).json({
          success: true,
          message: 'Cart ready',
          data: {
            cart_id: cart.id,
            user_id: cart.user_id,
            status: cart.status
          }
        });
      }

      // Guest: chỉ cho tạo cart guest (user_id = null). Không cho set user_id từ client.
      const cart = await Cart.create({
        user_id: null,
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

      if (!variant_id || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: variant_id, quantity'
        });
      }

      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be at least 1'
        });
      }

      const ctx = await this._resolveCartContext(req);
      if (ctx.error) {
        return res.status(ctx.error.status).json({ success: false, message: ctx.error.message });
      }

      // Nếu user đã login thì bỏ qua cart_id client gửi lên
      const effectiveCartId = ctx.cart.id;

      if (!effectiveCartId) {
        return res.status(400).json({
          success: false,
          message: 'cart_id is required'
        });
      }

      // Kiểm tra variant có tồn tại và lấy số lượng tồn kho
      const variant = await sequelize.sequelize.query(
        `SELECT id, product_id, quantity as available_quantity FROM variant WHERE id = ?`,
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

      // Kiểm tra tồn kho có đủ không
      if (variant[0].available_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Số lượng không đủ! Yêu cầu: ${quantity}, Tồn kho: ${variant[0].available_quantity}`
        });
      }

      // Kiểm tra sản phẩm đã có trong giỏ chưa
      const existingItem = await CartItem.findOne({
        where: {
          cart_id: effectiveCartId,
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
          cart_id: effectiveCartId,
          variant_id: variant_id,
          quantity: quantity
        });
      }

      // Fetch detailed info for the single item (including product/variant details)
      const [detailed] = await sequelize.sequelize.query(
        `SELECT ci.id, ci.cart_id, ci.variant_id, ci.quantity,
                v.id as variant_id, v.product_id, v.color_id, v.size_id,
                p.name as product_name, p.image as product_image,
                COALESCE(v.image, p.image) as image,
                c.name as color, s.size,
                v.price as original_price, v.price_sale as priceSale
         FROM cart_item ci
         LEFT JOIN variant v ON ci.variant_id = v.id
         LEFT JOIN products p ON v.product_id = p.id
         LEFT JOIN color c ON v.color_id = c.id
         LEFT JOIN size s ON v.size_id = s.id
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

      const cartItem = await CartItem.findByPk(itemId, {
        include: [{ model: Cart, as: 'cart' }]
      });
      if (!cartItem) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      // Scope theo user nếu đã đăng nhập
      const userId = req.user?.id ? Number(req.user.id) : null;
      if (userId) {
        if (!cartItem.cart || Number(cartItem.cart.user_id) !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to update this cart item'
          });
        }
      } else {
        // Guest chỉ được sửa item thuộc cart guest
        if (cartItem.cart?.user_id) {
          return res.status(403).json({
            success: false,
            message: 'Cart item belongs to a user. Please login.'
          });
        }
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

      const cartItem = await CartItem.findByPk(itemId, {
        include: [{ model: Cart, as: 'cart' }]
      });
      if (!cartItem) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      const userId = req.user?.id ? Number(req.user.id) : null;
      if (userId) {
        if (!cartItem.cart || Number(cartItem.cart.user_id) !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to remove this cart item'
          });
        }
      } else {
        if (cartItem.cart?.user_id) {
          return res.status(403).json({
            success: false,
            message: 'Cart item belongs to a user. Please login.'
          });
        }
      }

      // Xóa sản phẩm khỏi giỏ
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
      const ctx = await this._resolveCartContext(req);
      if (ctx.error) {
        return res.status(ctx.error.status).json({ success: false, message: ctx.error.message });
      }

      const effectiveCartId = ctx.cart.id;
      if (!effectiveCartId) {
        return res.status(400).json({
          success: false,
          message: 'cart_id is required'
        });
      }

      // Xóa tất cả items trong giỏ
      await CartItem.destroy({
        where: { cart_id: effectiveCartId }
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
      const ctx = await this._resolveCartContext(req);
      if (ctx.error) {
        return res.status(ctx.error.status).json({ success: false, message: ctx.error.message });
      }

      const effectiveCartId = ctx.cart.id;
      if (!effectiveCartId) {
        return res.status(400).json({
          success: false,
          message: 'cart_id is required'
        });
      }

      const total = await sequelize.sequelize.query(
        `SELECT SUM(ci.quantity * COALESCE(v.price_sale, v.price)) as total_price
         FROM cart_item ci
         LEFT JOIN variant v ON ci.variant_id = v.id
         LEFT JOIN products p ON v.product_id = p.id
         WHERE ci.cart_id = ?`,
        {
          replacements: [effectiveCartId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      return res.status(200).json({
        success: true,
        data: {
          cart_id: effectiveCartId,
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

  // Hoàn lại tồn kho khi người dùng xóa sản phẩm khỏi giỏ hàng (từ localStorage)
  async restoreInventory(req, res) {
    try {
      const { variant_id, quantity } = req.body;

      if (!variant_id || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: variant_id, quantity'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'No inventory restore needed before checkout'
      });
    } catch (error) {
      console.error('Error in restoreInventory:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new CartController();
