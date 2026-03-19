const { sequelize } = require('./config/database');
require('dotenv').config();

const fixOrdersTable = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');

    // Check if column exists
    const tableDescription = await sequelize.query(
      `DESCRIBE orders`,
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('📋 Cộtủy kiểm tra hiện tại:');
    const columns = tableDescription.map(col => col.Field);
    columns.forEach(col => console.log(`  - ${col}`));

    // Check and add missing columns
    const missingColumns = [];
    
    if (!columns.includes('delivery_cost')) {
      missingColumns.push('delivery_cost');
      console.log('\n❌ Cột delivery_cost không tồn tại. Đang thêm...');
      
      await sequelize.query(`
        ALTER TABLE orders 
        ADD COLUMN delivery_cost DECIMAL(12, 2) DEFAULT 0 
        AFTER total_price
      `);

      console.log('✅ Đã thêm cột delivery_cost thành công!');
    }

    // Verify the columns now exist
    const updatedTable = await sequelize.query(
      `DESCRIBE orders`,
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\n📋 Cấu trúc bảng orders sau khi cập nhật:');
    updatedTable.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

fixOrdersTable();
