const orderRepository = require('../repository/Order.repository');
const sequelize = require('../../config/database');

class OrderHistoryController {
  // Lấy lịch sử đơn hàng của user
  async getOrderHistory(req, res) {
    console.log('=== ORDER HISTORY CONTROLLER CALLED ===');
    try {
      const userId = parseInt(req.user.id);
      console.log('Getting order history for userId:', userId, 'from token user:', req.user);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Không được ủy quyền'
        });
      }

      const orders = await sequelize.sequelize.query(
        `SELECT o.id, o.user_id, o.total_price, o.status, o.create_at, o.delivery_cost, o.note
         FROM orders o
         WHERE o.user_id = ?
         ORDER BY o.create_at DESC`,
        {
          replacements: [userId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      console.log('Query result:', orders);

      // If no orders, return empty array
      if (orders.length === 0) {
        return res.status(200).json({
          success: true,
          data: []
        });
      }

      // Lấy chi tiết sản phẩm cho từng đơn hàng
      for (let order of orders) {
        console.log('Getting details for order:', order.id);
        try {
          const orderDetails = await sequelize.sequelize.query(
            `SELECT od.id, od.order_id, od.quantity, od.price, od.variant_id,
                    v.id as variant_id, v.product_id, v.image as variant_image, v.color_id, v.size_id,
                    p.name as product_name, p.image as product_image,
                    c.name as color_name
             FROM order_details od
             LEFT JOIN variant v ON od.variant_id = v.id
             LEFT JOIN products p ON v.product_id = p.id
             LEFT JOIN color c ON v.color_id = c.id
             WHERE od.order_id = ?`,
            {
              replacements: [order.id],
              type: sequelize.sequelize.QueryTypes.SELECT
            }
          );
          console.log('Order details result for order', order.id, ':', orderDetails);
          
          // Xử lý dữ liệu: sử dụng variant_image nếu có, nếu không thì dùng product_image
          order.items = (orderDetails || []).map(item => ({
            ...item,
            image: item.variant_image || item.product_image
          }));
          order.canReview = order.status === 'delivered';
          console.log('Order', order.id, 'has', order.items.length, 'items');
        } catch (detailError) {
          console.error('Error getting details for order', order.id, ':', detailError);
          order.items = [];
          order.canReview = false;
        }
      }

      return res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error('Error in getOrderHistory:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy chi tiết một đơn hàng
  async getOrderDetail(req, res) {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;

      const order = await sequelize.sequelize.query(
        `SELECT o.* FROM orders o WHERE o.id = ? AND o.user_id = ?`,
        {
          replacements: [orderId, userId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      if (order.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }

      // Lấy chi tiết các sản phẩm trong đơn hàng
      const orderDetails = await sequelize.sequelize.query(
        `SELECT od.id, od.order_id, od.quantity, od.price, od.variant_id,
                v.id as variant_id, v.product_id, v.color_id, v.size_id, v.price as variant_price, v.price_sale as variant_price_sale, v.image as variant_image,
                p.name as product_name, p.image as product_image,
                c.name as color_name, s.size as size_name
         FROM order_details od
         LEFT JOIN variant v ON od.variant_id = v.id
         LEFT JOIN products p ON v.product_id = p.id
         LEFT JOIN color c ON v.color_id = c.id
         LEFT JOIN size s ON v.size_id = s.id
         WHERE od.order_id = ?`,
        {
          replacements: [orderId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      return res.status(200).json({
        success: true,
        data: {
          order: order[0],
          items: orderDetails,
          canReview: order[0].status === 'delivered'
        }
      });
    } catch (error) {
      console.error('Error in getOrderDetail:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy lịch sử trạng thái đơn hàng
  async getOrderTimeline(req, res) {
    try {
      const orderId = req.params.id;
      const userId = req.user.id;

      // Kiểm tra xem user có quyền xem đơn hàng này không
      const orderCheck = await sequelize.sequelize.query(
        `SELECT id FROM orders WHERE id = ? AND user_id = ?`,
        {
          replacements: [orderId, userId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      if (orderCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }

      // Tạo timeline dựa trên status
      const order = await sequelize.sequelize.query(
        `SELECT id, status, create_at FROM orders WHERE id = ?`,
        {
          replacements: [orderId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      const timeline = this.generateTimeline(order[0]);

      return res.status(200).json({
        success: true,
        data: timeline
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Thêm review cho đơn hàng
  async addReview(req, res) {
    try {
      const { orderDetailId, rating, comment } = req.body;
      const userId = req.user.id;

      if (!orderDetailId || !rating) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu các trường bắt buộc (orderDetailId, rating)'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Đánh giá phải từ 1 đến 5'
        });
      }

      // Kiểm tra xem orderDetail có tồn tại và thuộc về user này
      const orderDetail = await sequelize.sequelize.query(
        `SELECT od.id, od.order_id, o.user_id, o.status
         FROM order_details od
         JOIN orders o ON od.order_id = o.id
         WHERE od.id = ?`,
        {
          replacements: [orderDetailId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      if (orderDetail.length === 0 || orderDetail[0].user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy chi tiết đơn hàng'
        });
      }

      // Kiểm tra trạng thái đơn hàng phải là 'delivered' mới cho phép đánh giá
      if (orderDetail[0].status !== 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể đánh giá khi đơn hàng đã được giao'
        });
      }

      // Thêm review
      const result = await sequelize.sequelize.query(
        `INSERT INTO order_reviews (order_detail_id, rating, comment, created_at, status)
         VALUES (?, ?, ?, NOW(), 1)`,
        {
          replacements: [orderDetailId, rating, comment || null],
          type: sequelize.sequelize.QueryTypes.INSERT
        }
      );

      return res.status(201).json({
        success: true,
        message: 'Đã thêm đánh giá thành công',
        data: {
          id: result[0],
          order_detail_id: orderDetailId,
          rating,
          comment
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cập nhật review
  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      if (!rating) {
        return res.status(400).json({
          success: false,
          message: 'Đánh giá là bắt buộc'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Đánh giá phải từ 1 đến 5'
        });
      }

      // Kiểm tra review thuộc về user
      const review = await sequelize.sequelize.query(
        `SELECT or.id, o.user_id, o.status
         FROM order_reviews or
         JOIN order_details od ON or.order_detail_id = od.id
         JOIN orders o ON od.order_id = o.id
         WHERE or.id = ?`,
        {
          replacements: [reviewId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      if (review.length === 0 || review[0].user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đánh giá'
        });
      }

      // Kiểm tra trạng thái đơn hàng phải là 'delivered' mới cho phép cập nhật đánh giá
      if (review[0].status !== 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể cập nhật đánh giá khi đơn hàng đã được giao'
        });
      }

      // Cập nhật review
      await sequelize.sequelize.query(
        `UPDATE order_reviews SET rating = ?, comment = ? WHERE id = ?`,
        {
          replacements: [rating, comment || null, reviewId],
          type: sequelize.sequelize.QueryTypes.UPDATE
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Đã cập nhật đánh giá thành công'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy reviews của đơn hàng
  async getOrderReviews(req, res) {
    try {
      const userId = req.user.id;
      const orderId = req.params.orderId;

      // Kiểm tra đơn hàng thuộc về user
      const order = await sequelize.sequelize.query(
        `SELECT id FROM orders WHERE id = ? AND user_id = ?`,
        {
          replacements: [orderId, userId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      if (order.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }

      // Lấy reviews
      const reviews = await sequelize.sequelize.query(
        `SELECT or.id, or.order_detail_id, or.rating, or.comment, or.created_at,
                od.quantity, od.price, p.name as product_name, p.image
         FROM order_reviews or
         JOIN order_details od ON or.order_detail_id = od.id
         LEFT JOIN variant v ON od.variant_id = v.id
         LEFT JOIN products p ON v.product_id = p.id
         WHERE od.order_id = ?`,
        {
          replacements: [orderId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      return res.status(200).json({
        success: true,
        data: reviews
      });
    } catch (error) {
      console.error('Error in getOrderReviews:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cập nhật trạng thái đơn hàng (chỉ cho testing)
  async updateOrderStatus(req, res) {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const { status } = req.body;

      // Kiểm tra đơn hàng thuộc về user
      const order = await sequelize.sequelize.query(
        `SELECT id, status FROM orders WHERE id = ? AND user_id = ?`,
        {
          replacements: [orderId, userId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      if (order.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }

      // Cập nhật trạng thái
      await sequelize.sequelize.query(
        `UPDATE orders SET status = ? WHERE id = ?`,
        {
          replacements: [status, orderId],
          type: sequelize.sequelize.QueryTypes.UPDATE
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        data: {
          order_id: orderId,
          old_status: order[0].status,
          new_status: status
        }
      });
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Helper function tạo timeline
  generateTimeline(order) {
    const statusTimeline = {
      pending: { stage: 1, label: 'Chờ xác nhận', completed: true },
      confirmed: { stage: 2, label: 'Đã xác nhận', completed: order.status !== 'pending' },
      shipped: { stage: 3, label: 'Đang giao', completed: ['shipped', 'delivered', 'cancelled'].includes(order.status) },
      delivered: { stage: 4, label: 'Đã giao', completed: order.status === 'delivered' },
      cancelled: { stage: 5, label: 'Đã hủy', completed: order.status === 'cancelled' }
    };

    return {
      order_id: order.id,
      current_status: order.status,
      timeline: statusTimeline,
      created_at: order.create_at
    };
  }
}

module.exports = new OrderHistoryController();
