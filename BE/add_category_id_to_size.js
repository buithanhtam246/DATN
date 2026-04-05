const db = require('./config/database');

(async () => {
  try {
    console.log('🔄 Adding category_id column to size table...');
    
    // Kiểm tra xem column đã tồn tại chưa
    const result = await db.sequelize.query('DESC size', { raw: true });
    const hasColumn = result[0].some(r => r.Field === 'category_id');
    
    if (hasColumn) {
      console.log('✅ category_id column đã tồn tại');
      process.exit(0);
    }
    
    // Thêm column category_id
    await db.sequelize.query(
      'ALTER TABLE size ADD COLUMN category_id INT DEFAULT NULL AFTER gender'
    );
    console.log('✅ Đã thêm column category_id');
    
    // Thêm foreign key
    await db.sequelize.query(
      'ALTER TABLE size ADD CONSTRAINT fk_size_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL'
    );
    console.log('✅ Đã thêm foreign key');
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
