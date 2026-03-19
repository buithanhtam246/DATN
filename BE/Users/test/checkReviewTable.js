const { sequelize } = require('./config/database');
require('dotenv').config();

const checkAndFixReviewTable = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');

    // Check if order_reviews table exists
    const tableDescription = await sequelize.query(
      `DESCRIBE order_reviews`,
      { type: sequelize.QueryTypes.SELECT }
    ).catch(() => null);

    if (!tableDescription) {
      console.log('❌ Bảng order_reviews không tồn tại. Đang tạo...');
      
      await sequelize.query(`
        CREATE TABLE order_reviews (
          id INT PRIMARY KEY AUTO_INCREMENT,
          order_detail_id INT NULL,
          rating INT NULL,
          comment TEXT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TINYINT DEFAULT 1,
          FOREIGN KEY (order_detail_id) REFERENCES order_details(id)
        )
      `);

      console.log('✅ Đã tạo bảng order_reviews thành công!');
    } else {
      console.log('✅ Bảng order_reviews đã tồn tại');
      
      // Check if columns exist
      const columns = tableDescription.map(col => col.Field);
      
      if (!columns.includes('order_detail_id')) {
        await sequelize.query(`ALTER TABLE order_reviews ADD COLUMN order_detail_id INT NULL`);
        console.log('✅ Thêm cột order_detail_id');
      }
      
      if (!columns.includes('rating')) {
        await sequelize.query(`ALTER TABLE order_reviews ADD COLUMN rating INT NULL`);
        console.log('✅ Thêm cột rating');
      }
      
      if (!columns.includes('comment')) {
        await sequelize.query(`ALTER TABLE order_reviews ADD COLUMN comment TEXT NULL`);
        console.log('✅ Thêm cột comment');
      }
      
      if (!columns.includes('created_at')) {
        await sequelize.query(`ALTER TABLE order_reviews ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
        console.log('✅ Thêm cột created_at');
      }
      
      if (!columns.includes('status')) {
        await sequelize.query(`ALTER TABLE order_reviews ADD COLUMN status TINYINT DEFAULT 1`);
        console.log('✅ Thêm cột status');
      }
    }

    // Show final table structure
    const finalTable = await sequelize.query(
      `DESCRIBE order_reviews`,
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\n📋 Cấu trúc bảng order_reviews hiện tại:');
    finalTable.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n✅ Kiểm tra và cập nhật database xong!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

checkAndFixReviewTable();
