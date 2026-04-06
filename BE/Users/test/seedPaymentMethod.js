require('dotenv').config();
const { sequelize } = require('./config/database');
const PaymentMethod = require('./Users/model/PaymentMethod.model');

const seedPaymentMethods = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');

    await sequelize.sync();

    // Xóa payment methods cũ (nếu muốn)
    await PaymentMethod.destroy({ where: {} });
    console.log('🗑️  Đã xóa payment methods cũ');

    // Thêm payment methods
    const methods = [
      { name: 'COD - Thanh toán khi nhận hàng' },
      { name: 'VNPay - Ví điện tử' },
      { name: 'Bank Transfer - Chuyển khoản ngân hàng' },
      { name: 'Credit Card - Thẻ tín dụng' },
      { name: 'Momo - Ví điện tử Momo' }
    ];

    await PaymentMethod.bulkCreate(methods);
    console.log('✅ Đã thêm 5 phương thức thanh toán');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

seedPaymentMethods();
