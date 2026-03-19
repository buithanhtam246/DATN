const voucherService = require('../service/voucher.service');

class VoucherController {
  // Lấy danh sách voucher có sẵn
  async getAvailable(req, res) {
    try {
      const vouchers = await voucherService.getAvailableVouchers();
      
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

  // Kiểm tra voucher
  async checkVoucher(req, res) {
    try {
      const { code, totalPrice } = req.body || {};

      if (!code || !totalPrice) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu mã voucher hoặc tổng tiền. Vui lòng gửi: { code: "...", totalPrice: ... }'
        });
      }

      const result = await voucherService.validateAndCalculateDiscount(code, totalPrice);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          voucherId: result.voucher.id,
          code: result.voucher.code,
          name: result.voucher.name,
          discountAmount: result.discountAmount,
          originalPrice: totalPrice,
          finalPrice: result.finalPrice
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  // Lấy chi tiết voucher
  async getDetail(req, res) {
    try {
      const { code } = req.params;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Mã voucher không được để trống'
        });
      }

      const result = await voucherService.getVoucherDetails(code);

      if (!result.valid) {
        return res.status(404).json({
          success: false,
          message: result.message
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

  // Tạo voucher mới
  async create(req, res) {
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
}

module.exports = new VoucherController();
