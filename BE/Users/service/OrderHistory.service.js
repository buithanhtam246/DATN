const sequelize = require('../../config/database');

class OrderHistoryService {
  // Lấy lịch sử đơn hàng
  async getUserOrderHistory(userId, limit = 10, offset = 0) {
    try {
      const orders = await sequelize.sequelize.query(
        `SELECT o.*, 
                COUNT(od.id) as item_count,
                SUM(od.quantity) as total_items
         FROM orders o
         LEFT JOIN order_details od ON o.id = od.order_id
         WHERE o.user_id = ?
         GROUP BY o.id
         ORDER BY o.create_at DESC
         LIMIT ? OFFSET ?`,
        {
          replacements: [userId, limit, offset],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      return orders;
    } catch (error) {
      throw error;
    }
  }

  // Lấy chi tiết đơn hàng
  async getOrderDetailInfo(orderId, userId) {
    try {
      const order = await sequelize.sequelize.query(
        `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
        {
          replacements: [orderId, userId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      if (order.length === 0) return null;

      const items = await sequelize.sequelize.query(
        `SELECT od.id, od.quantity, od.price,
                pv.id as variant_id, pv.name, pv.sku, pv.image,
                p.id as product_id, p.name as product_name
         FROM order_details od
         LEFT JOIN product_variants pv ON od.variant_id = pv.id
         LEFT JOIN products p ON pv.product_id = p.id
         WHERE od.order_id = ?`,
        {
          replacements: [orderId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      return {
        order: order[0],
        items: items
      };
    } catch (error) {
      throw error;
    }
  }

  // Tạo review
  async createReview(orderDetailId, userId, rating, comment) {
    try {
      // Kiểm tra orderDetail thuộc user
      const orderDetail = await sequelize.sequelize.query(
        `SELECT od.id FROM order_details od
         JOIN orders o ON od.order_id = o.id
         WHERE od.id = ? AND o.user_id = ?`,
        {
          replacements: [orderDetailId, userId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      if (orderDetail.length === 0) return null;

      const result = await sequelize.sequelize.query(
        `INSERT INTO order_reviews (order_detail_id, rating, comment, created_at, status)
         VALUES (?, ?, ?, NOW(), 1)`,
        {
          replacements: [orderDetailId, rating, comment],
          type: sequelize.sequelize.QueryTypes.INSERT
        }
      );

      return {
        id: result[0],
        order_detail_id: orderDetailId,
        rating,
        comment
      };
    } catch (error) {
      throw error;
    }
  }

  // Thống kê đơn hàng
  async getOrderStatistics(userId) {
    try {
      const stats = await sequelize.sequelize.query(
        `SELECT 
          COUNT(DISTINCT o.id) as total_orders,
          SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) as completed_orders,
          SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
          SUM(o.total_price) as total_spent
         FROM orders o
         WHERE o.user_id = ?`,
        {
          replacements: [userId],
          type: sequelize.sequelize.QueryTypes.SELECT
        }
      );

      return stats[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderHistoryService();
