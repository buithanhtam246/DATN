const { sequelize } = require('./config/database');
require('dotenv').config();

const addAddressIdColumn = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');

    // Check if column exists
    const tableDescription = await sequelize.query(
      `DESCRIBE orders`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const hasAddressId = tableDescription.some(col => col.Field === 'address_id');

    if (!hasAddressId) {
      console.log('❌ Cột address_id không tồn tại. Đang thêm...');
      
      await sequelize.query(`
        ALTER TABLE orders 
        ADD COLUMN address_id INT NULL 
        AFTER user_id
      `);

      console.log('✅ Đã thêm cột address_id thành công!');
    } else {
      console.log('✅ Cột address_id đã tồn tại.');
    }

    // Verify the column now exists
    const updatedTable = await sequelize.query(
      `DESCRIBE orders`,
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\n📋 Cấu trúc bảng orders hiện tại:');
    updatedTable.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

addAddressIdColumn();
