const db = require('./config/database');

(async () => {
  try {
    // Kiểm tra tất cả parent categories và gender của chúng
    const result = await db.sequelize.query(
      `SELECT c.id, c.name, c.gender, COUNT(DISTINCT s.id) as size_count
       FROM category c
       LEFT JOIN category_size cs ON c.id = cs.category_id
       LEFT JOIN size s ON cs.size_id = s.id
       WHERE c.is_parent = true
       GROUP BY c.id, c.name, c.gender`,
      { raw: true, type: db.sequelize.QueryTypes.SELECT }
    );
    console.log('Parent categories với số lượng sizes:');
    console.table(result);
    
    // Chi tiết hơn: các sizes của mỗi category
    const sizes = await db.sequelize.query(
      `SELECT c.id, c.name, c.gender, GROUP_CONCAT(s.size) as sizes
       FROM category c
       LEFT JOIN category_size cs ON c.id = cs.category_id
       LEFT JOIN size s ON cs.size_id = s.id
       WHERE c.is_parent = true
       GROUP BY c.id, c.name, c.gender`,
      { raw: true, type: db.sequelize.QueryTypes.SELECT }
    );
    console.log('\nChitiet sizes của từng category:');
    console.table(sizes);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
