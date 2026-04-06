const voucherRepository = require('../repository/voucher.repository');

class VoucherService {
  // Validate voucher và tính discount
  async validateAndCalculateDiscount(voucherCode, totalPrice) {
    // Đảm bảo totalPrice là number
    totalPrice = parseFloat(totalPrice) || 0;

    if (!voucherCode) {
      return {
        valid: true,
        discountAmount: 0,
        finalPrice: totalPrice,
        message: 'Không sử dụng voucher'
      };
    }

    // Tìm voucher theo code
    const voucher = await voucherRepository.findByCode(voucherCode);

    if (!voucher) {
      return {
        valid: false,
        message: 'Mã voucher không tồn tại'
      };
    }

    // Kiểm tra voucher đã hết hạn chưa
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (voucher.start_date && new Date(voucher.start_date) > new Date(today)) {
      return {
        valid: false,
        message: 'Voucher chưa có hiệu lực'
      };
    }

    if (voucher.promotion_date && new Date(voucher.promotion_date) < new Date(today)) {
      return {
        valid: false,
        message: 'Voucher đã hết hạn'
      };
    }

    // Kiểm tra số lượng voucher
    if (voucher.quantity <= 0) {
      return {
        valid: false,
        message: 'Voucher đã hết'
      };
    }

    // Kiểm tra đơn hàng tối thiểu
    const minOrder = parseFloat(voucher.minimum_order) || 0;
    if (minOrder && totalPrice < minOrder) {
      return {
        valid: false,
        message: `Đơn hàng phải tối thiểu ${minOrder.toLocaleString('vi-VN')} đ`
      };
    }

    // Tính discount theo loại khuyến mãi
    let discountAmount = 0;
    const valueReduced = parseFloat(voucher.value_reduced) || 0;
    const maxValue = parseFloat(voucher.max_value) || null;

    console.log('[DEBUG] Voucher calc:', { valueReduced, maxValue, totalPrice, promotion_type: voucher.promotion_type });

    if (voucher.promotion_type === 'percentage') {
      // Khuyến mãi theo phần trăm
      discountAmount = (totalPrice * valueReduced) / 100;
      
      // Kiểm tra giới hạn discount tối đa
      if (maxValue && discountAmount > maxValue) {
        discountAmount = maxValue;
      }
    } else if (voucher.promotion_type === 'fixed') {
      // Khuyến mãi số tiền cố định
      discountAmount = valueReduced;
    }

    console.log('[DEBUG] Final discount:', { discountAmount, type: typeof discountAmount });

    const finalPrice = totalPrice - discountAmount;

    return {
      valid: true,
      discountAmount: parseFloat(parseFloat(discountAmount).toFixed(2)),
      finalPrice: parseFloat(parseFloat(finalPrice).toFixed(2)),
      voucher: {
        id: voucher.id,
        code: voucher.code_voucher,
        name: voucher.name_voucher
      },
      message: 'Áp dụng voucher thành công'
    };
  }

  // Lấy tất cả voucher có sẵn (cho người dùng xem)
  async getAvailableVouchers() {
    const today = new Date().toISOString().split('T')[0];
    
    const vouchers = await voucherRepository.getAll();
    
    return vouchers.filter(v => {
      // Kiểm tra ngày bắt đầu
      if (v.start_date && new Date(v.start_date) > new Date(today)) {
        return false;
      }
      // Kiểm tra ngày kết thúc
      if (v.promotion_date && new Date(v.promotion_date) < new Date(today)) {
        return false;
      }
      // Kiểm tra số lượng
      if (v.quantity <= 0) {
        return false;
      }
      return true;
    }).map(v => ({
      id: v.id,
      code: v.code_voucher,
      name: v.name_voucher,
      discountType: v.promotion_type,
      discountValue: v.value_reduced,
      maxDiscount: v.max_value,
      minimumOrder: v.minimum_order,
      quantity: v.quantity,
      startDate: v.start_date,
      endDate: v.promotion_date
    }));
  }

  // Lấy chi tiết voucher
  async getVoucherDetails(voucherCode) {
    const voucher = await voucherRepository.findByCode(voucherCode);

    if (!voucher) {
      return {
        valid: false,
        message: 'Voucher không tồn tại'
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const isValid = 
      (!voucher.start_date || new Date(voucher.start_date) <= new Date(today)) &&
      (!voucher.promotion_date || new Date(voucher.promotion_date) >= new Date(today)) &&
      voucher.quantity > 0;

    return {
      valid: isValid,
      id: voucher.id,
      code: voucher.code_voucher,
      name: voucher.name_voucher,
      discountType: voucher.promotion_type,
      discountValue: voucher.value_reduced,
      maxDiscount: voucher.max_value,
      minimumOrder: voucher.minimum_order,
      usageLimit: voucher.quantity_user,
      quantityRemaining: voucher.quantity,
      startDate: voucher.start_date,
      endDate: voucher.promotion_date
    };
  }

  // Tạo voucher mới
  async createVoucher(data) {
    // Validate dữ liệu
    if (!data.code_voucher) {
      throw new Error('Mã voucher không được để trống');
    }

    if (!data.name_voucher) {
      throw new Error('Tên voucher không được để trống');
    }

    if (!data.promotion_type || !['percentage', 'fixed'].includes(data.promotion_type)) {
      throw new Error('Loại khuyến mãi phải là "percentage" hoặc "fixed"');
    }

    if (!data.value_reduced || data.value_reduced <= 0) {
      throw new Error('Giá trị khuyến mãi phải lớn hơn 0');
    }

    // Kiểm tra voucher đã tồn tại
    const existing = await voucherRepository.findByCode(data.code_voucher);
    if (existing) {
      throw new Error('Mã voucher này đã tồn tại');
    }

    // Tạo voucher
    const newVoucher = await voucherRepository.create({
      code_voucher: data.code_voucher,
      name_voucher: data.name_voucher,
      value_reduced: data.value_reduced,
      promotion_type: data.promotion_type,
      quantity: data.quantity || 100,
      max_value: data.max_value || null,
      quantity_user: data.quantity_user || 1,
      minimum_order: data.minimum_order || 0,
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      promotion_date: data.promotion_date || null
    });

    return {
      success: true,
      message: 'Tạo voucher thành công',
      data: {
        id: newVoucher.id,
        code: newVoucher.code_voucher,
        name: newVoucher.name_voucher
      }
    };
  }

  // Admin methods
  async getAllVouchers() {
    return await voucherRepository.getAll();
  }

  async getVoucherById(id) {
    return await voucherRepository.findById(id);
  }

  async updateVoucher(id, data) {
    // Validate dữ liệu nếu cần
    if (data.code_voucher) {
      const existing = await voucherRepository.findByCode(data.code_voucher);
      if (existing && existing.id != id) {
        throw new Error('Mã voucher này đã tồn tại');
      }
    }

    const [updatedRows] = await voucherRepository.update(id, data);

    if (updatedRows === 0) {
      throw new Error('Voucher không tồn tại');
    }

    return {
      success: true,
      message: 'Cập nhật voucher thành công'
    };
  }

  async deleteVoucher(id) {
    const deletedRows = await voucherRepository.delete(id);

    if (deletedRows === 0) {
      throw new Error('Voucher không tồn tại');
    }

    return {
      success: true,
      message: 'Xóa voucher thành công'
    };
  }
}

module.exports = new VoucherService();
