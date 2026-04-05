const db = require('./config/database');

(async () => {
  try {
    console.log('🔄 Updating existing sizes to set category_id based on gender...');
    
    // Map gender to category_id
    const genderMap = {
      'male': 1,      // Nam
      'female': 2,    // Nữ
      'unisex': 15    // Unisex
    };
    
    for (const [gender, categoryId] of Object.entries(genderMap)) {
      const result = await db.sequelize.query(
        'UPDATE size SET category_id = ? WHERE gender = ? AND category_id IS NULL',
        {
          replacements: [categoryId, gender],
          type: db.sequelize.QueryTypes.UPDATE
        }
      );
      console.log(`✅ Updated ${result[1] || 0} sizes for gender '${gender}' -> category_id=${categoryId}`);
    }
    
    console.log('✅ Done!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
