const PaymentMethod = require('../model/PaymentMethod.model');

class PaymentMethodController {
  // Lấy tất cả phương thức thanh toán
  async getAll(req, res) {
    try {
      const methods = await PaymentMethod.findAll({
        attributes: ['id', 'name'],
        raw: true
      });

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách phương thức thanh toán thành công',
        data: methods
      });
    } catch (error) {
      console.error('Error getting payment methods:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PaymentMethodController();
