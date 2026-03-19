const voucherService = require('../service/voucher.service');

class VoucherAdminController {
  // Lấy tất cả voucher (cho admin)
  async getAllVouchers(req, res) {
    try {
      const vouchers = await voucherService.getAllVouchers();

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách voucher thành công',
        data: vouchers
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  // Tạo voucher mới
  async createVoucher(req, res) {
    try {
      const result = await voucherService.createVoucher(req.body);

      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }

  // Cập nhật voucher
  async updateVoucher(req, res) {
    try {
      const { id } = req.params;
      const result = await voucherService.updateVoucher(id, req.body);

      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }

  // Xóa voucher
  async deleteVoucher(req, res) {
    try {
      const { id } = req.params;
      const result = await voucherService.deleteVoucher(id);

      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }

  // Lấy chi tiết voucher
  async getVoucherDetail(req, res) {
    try {
      const { id } = req.params;
      const result = await voucherService.getVoucherById(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Voucher không tồn tại'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lấy chi tiết voucher thành công',
        data: result
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new VoucherAdminController();