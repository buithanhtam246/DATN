const db = require('./config/database');

(async () => {
  try {
    const maleSizes = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
    for (const size of maleSizes) {
      await db.sequelize.query(
        'INSERT INTO size (size, gender, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        {
          replacements: [size, 'male'],
          type: db.sequelize.QueryTypes.INSERT
        }
      );
      console.log(`✅ Added size ${size} for male`);
    }
    console.log('\n✅ All sizes added for male');
    process.exit(0);
  } catch(e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
