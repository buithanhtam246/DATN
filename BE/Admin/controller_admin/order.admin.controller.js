// Controller dành cho các thao tác đơn hàng mà chỉ admin mới thực hiện được
const { sequelize } = require('../../config/database');
const Order = require('../../Users/model/Order.model');

class OrderAdminController {
  // Lấy toàn bộ đơn hàng
  async list(req, res) {
    try {
      const orders = await Order.findAll();
      res.json({ success: true, data: orders });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Cập nhật trạng thái (bỏ qua kiểm tra owner vì admin)
  async updateStatus(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      if (isNaN(orderId)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });

      const order = await Order.findByPk(orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
      order.status = status;
      await order.save();
      res.json({ success: true, data: order });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new OrderAdminController();