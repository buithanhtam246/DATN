const orderService = require('../service/Order.service');

class OrderController {
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