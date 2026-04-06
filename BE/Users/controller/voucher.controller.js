const voucherService = require('../service/voucher.service');

class VoucherController {
  // Lấy danh sách voucher có sẵn (Khớp với màn hình bạn đang hiển thị)
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

  // Kiểm tra voucher khi khách hàng áp dụng mã
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

  // Lấy chi tiết một voucher cụ thể qua mã code
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

  // Tạo voucher mới (Đã chạy thành công theo xác nhận của bạn)
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

  /**
   * HÀM XÓA VOUCHER (MỚI BỔ SUNG)
   * Giải quyết lỗi 404 Not Found trong Console log của bạn
   */
  async deleteVoucher(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp ID voucher để xóa'
        });
      }

      const result = await voucherService.deleteVoucher(id);

      res.status(200).json({
        success: true,
        message: 'Xóa voucher thành công',
        data: result
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || 'Lỗi hệ thống khi xóa voucher'
      });
    }
  }
}

module.exports = new VoucherController();