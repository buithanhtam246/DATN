// Script để chạy migration thêm cột customer_note
const mysql = require('mysql2/promise');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Bui@123',
    database: 'DATN_DB'
  });

  try {
    console.log('⏳ Chạy migration...');
    
    // Thêm cột customer_note nếu chưa có
    await connection.execute(
      `ALTER TABLE orders ADD COLUMN customer_note TEXT NULL AFTER note`
    );
    
    console.log('✅ Migration thành công! Cột customer_note đã được thêm vào bảng orders');
    
    // Verify
    const [columns] = await connection.execute('DESCRIBE orders');
    console.log('\n📋 Cấu trúc bảng orders:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

  } catch (error) {
    if (error.message.includes('Duplicate column')) {
      console.log('✅ Cột customer_note đã tồn tại!');
    } else {
      console.error('❌ Lỗi:', error.message);
    }
  } finally {
    await connection.end();
  }
}

runMigration();
