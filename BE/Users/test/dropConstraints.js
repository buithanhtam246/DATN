require('dotenv').config();
const { sequelize } = require('./config/database');

const dropConstraints = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');

    // 1. Xóa Foreign Key cho order_details.variant_id
    const result1 = await sequelize.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'order_details' AND COLUMN_NAME = 'variant_id' AND REFERENCED_TABLE_NAME IS NOT NULL`,
      { raw: true }
    );

    if (result1[0].length > 0) {
      const constraintName = result1[0][0].CONSTRAINT_NAME;
      console.log('🗑️  Đang xóa constraint:', constraintName);
      await sequelize.query(`ALTER TABLE order_details DROP FOREIGN KEY ${constraintName}`);
      console.log('✅ Đã xóa Foreign Key constraint order_details.variant_id');
    }

    // 2. Xóa Foreign Key cho order_details.order_id
    const result2 = await sequelize.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'order_details' AND COLUMN_NAME = 'order_id' AND REFERENCED_TABLE_NAME IS NOT NULL`,
      { raw: true }
    );

    if (result2[0].length > 0) {
      const constraintName = result2[0][0].CONSTRAINT_NAME;
      console.log('🗑️  Đang xóa constraint:', constraintName);
      await sequelize.query(`ALTER TABLE order_details DROP FOREIGN KEY ${constraintName}`);
      console.log('✅ Đã xóa Foreign Key constraint order_details.order_id');
    }

    // 3. Xóa Foreign Key cho orders.voucher_id
    const result3 = await sequelize.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'voucher_id' AND REFERENCED_TABLE_NAME IS NOT NULL`,
      { raw: true }
    );

    if (result3[0].length > 0) {
      const constraintName = result3[0][0].CONSTRAINT_NAME;
      console.log('🗑️  Đang xóa constraint:', constraintName);
      await sequelize.query(`ALTER TABLE orders DROP FOREIGN KEY ${constraintName}`);
      console.log('✅ Đã xóa Foreign Key constraint orders.voucher_id');
    }

    // 4. Xóa Foreign Key cho orders.payment_method_id
    const result4 = await sequelize.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'payment_method_id' AND REFERENCED_TABLE_NAME IS NOT NULL`,
      { raw: true }
    );

    if (result4[0].length > 0) {
      const constraintName = result4[0][0].CONSTRAINT_NAME;
      console.log('🗑️  Đang xóa constraint:', constraintName);
      await sequelize.query(`ALTER TABLE orders DROP FOREIGN KEY ${constraintName}`);
      console.log('✅ Đã xóa Foreign Key constraint orders.payment_method_id');
    }

    // 5. Xóa Foreign Key cho orders.user_id
    const result5 = await sequelize.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME IS NOT NULL`,
      { raw: true }
    );

    if (result5[0].length > 0) {
      const constraintName = result5[0][0].CONSTRAINT_NAME;
      console.log('🗑️  Đang xóa constraint:', constraintName);
      await sequelize.query(`ALTER TABLE orders DROP FOREIGN KEY ${constraintName}`);
      console.log('✅ Đã xóa Foreign Key constraint orders.user_id');
    }

    console.log('\n✅ Hoàn tất! Tất cả Foreign Key constraints đã được xóa.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

dropConstraints();
