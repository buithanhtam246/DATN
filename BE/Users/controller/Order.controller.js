const orderService = require('../service/Order.service');
const Order = require('../model/Order.model');
const OrderDetail = require('../model/OrderDetail.model');
const User = require('../model/user.model');
const ProductVariant = require('../model/ProductVariant.model');

class OrderController {
  // Lấy tất cả đơn hàng (cho admin)
  async getAllOrders(req, res) {
    try {
      const orders = await Order.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'phone'],
            as: 'user'
          },
          {
            model: OrderDetail,
            attributes: ['id', 'variant_id', 'quantity', 'price'],
            as: 'orderDetails',
            include: [
              {
                model: ProductVariant,
                attributes: ['id', 'product_id'],
                as: 'variant'
              }
            ]
          }
        ],
        order: [['create_at', 'DESC']],
        attributes: ['id', 'user_id', 'total_price', 'delivery_cost', 'status', 'create_at', 'payment_method']
      });

      const formattedOrders = orders.map(order => ({
        id: order.id,
        customerName: order.user?.name || 'Ẩn danh',
        email: order.user?.email,
        phone: order.user?.phone,
        totalPrice: order.total_price,
        deliveryCost: order.delivery_cost,
        status: order.status,
        paymentMethod: order.payment_method,
        productCount: order.orderDetails?.length || 0,
        created_at: order.create_at
      }));

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách đơn hàng thành công',
        data: formattedOrders
      });
    } catch (err) {
      console.error('getAllOrders error:', err);
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  async create(req, res) {
    try {
      const userId = req.user.id; // Lấy từ token đăng nhập
      const order = await orderService.checkout(userId, req.body);
      
      res.status(201).json({
        success: true,
        message: "Đặt hàng thành công!",
        data: order
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  // Lấy chi tiết đơn hàng
  async getOrderDetails(req, res) {
    try {
      const userId = req.user.id;
      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        return res.status(400).json({
          success: false,
          message: "ID đơn hàng không hợp lệ"
        });
      }

      const order = await orderService.getOrderDetails(orderId, userId);

      res.status(200).json({
        success: true,
        message: "Lấy chi tiết đơn hàng thành công",
        data: order
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  // Cập nhật trạng thái đơn hàng
  async updateStatus(req, res) {
    try {
      const userId = req.user.id;
      const orderId = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(orderId)) {
        return res.status(400).json({ success: false, message: 'ID đơn hàng không hợp lệ' });
      }
      if (!status) {
        return res.status(400).json({ success: false, message: 'Cần cung cấp trạng thái mới' });
      }

      const updated = await orderService.changeStatus(orderId, req.user, status);
      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: updated
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new OrderController();