const db = require('./config/database');

(async () => {
  try {
    // Sửa ENUM type của column gender
    await db.sequelize.query("ALTER TABLE size MODIFY gender ENUM('male','female','unisex')");
    console.log('✅ Đã sửa ENUM để thêm unisex');
    
    // Verify
    const result = await db.sequelize.query('DESC size', { raw: true });
    const genderCol = result[0].find(r => r.Field === 'gender');
    console.log('New gender type:', genderCol.Type);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
