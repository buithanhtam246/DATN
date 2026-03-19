const Voucher = require('../model/Voucher.model');

class VoucherRepository {
  // Tìm voucher theo code
  async findByCode(code) {
    return await Voucher.findOne({
      where: { code_voucher: code }
    });
  }

  // Tìm voucher theo ID
  async findById(id) {
    return await Voucher.findByPk(id);
  }

  // Lấy tất cả voucher (cho admin)
  async getAll() {
    return await Voucher.findAll();
  }

  // Tạo voucher mới (cho admin)
  async create(data) {
    return await Voucher.create(data);
  }

  // Cập nhật voucher
  async update(id, data) {
    return await Voucher.update(data, {
      where: { id }
    });
  }

  // Xóa voucher
  async delete(id) {
    return await Voucher.destroy({
      where: { id }
    });
  }

  // Giảm số lượng voucher khi sử dụng
  async decrementQuantity(voucherId) {
    return await Voucher.decrement('quantity', {
      where: { id: voucherId }
    });
  }
}

module.exports = new VoucherRepository();
