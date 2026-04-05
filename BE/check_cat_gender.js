const db = require('./config/database');

(async () => {
  try {
    const cats = await db.sequelize.query(
      'SELECT id, name, parent_id, gender FROM categories WHERE parent_id IS NULL ORDER BY name',
      { raw: true, type: db.sequelize.QueryTypes.SELECT }
    );
    console.log('Parent categories:');
    cats.forEach(c => {
      const gen = c.gender || 'NULL';
      console.log(`[${c.id}] ${c.name} - gender: ${gen}`);
    });
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
