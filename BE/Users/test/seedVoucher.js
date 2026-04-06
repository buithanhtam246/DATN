require('dotenv').config();
const { sequelize } = require('./config/database');
const Voucher = require('./Users/model/Voucher.model');

const seedVouchers = async () => {
  try {
    // Test kết nối database
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');

    // Sync model
    await sequelize.sync();

    // Xóa voucher cũ (nếu muốn)
    await Voucher.destroy({ where: {} });
    console.log('🗑️  Đã xóa voucher cũ');

    // Thêm voucher test
    const vouchers = [
      {
        code_voucher: 'SALE50',
        name_voucher: 'Giảm 50%',
        value_reduced: 50,
        promotion_type: 'percentage',
        quantity: 100,
        max_value: 500000,
        quantity_user: 1,
        minimum_order: 100000,
        start_date: '2026-01-01',
        promotion_date: '2026-12-31'
      },
      {
        code_voucher: 'SAVE100K',
        name_voucher: 'Giảm 100K',
        value_reduced: 100000,
        promotion_type: 'fixed',
        quantity: 50,
        max_value: null,
        quantity_user: 1,
        minimum_order: 300000,
        start_date: '2026-01-01',
        promotion_date: '2026-12-31'
      },
      {
        code_voucher: 'WELCOME30',
        name_voucher: 'Chào mừng giảm 30%',
        value_reduced: 30,
        promotion_type: 'percentage',
        quantity: 200,
        max_value: 300000,
        quantity_user: 1,
        minimum_order: 50000,
        start_date: '2026-01-01',
        promotion_date: '2026-12-31'
      }
    ];

    await Voucher.bulkCreate(vouchers);
    console.log('✅ Đã thêm 3 voucher test:');
    console.log('  - SALE50: Giảm 50% (max 500K)');
    console.log('  - SAVE100K: Giảm 100K cố định');
    console.log('  - WELCOME30: Giảm 30% (max 300K)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

seedVouchers();
