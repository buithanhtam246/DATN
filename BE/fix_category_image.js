const { sequelize } = require('./config/database');

sequelize.query('UPDATE categories SET size_guide_image_url = ? WHERE id = 40', {
  replacements: ['size-guide-1774948404493-836307471.png']
}).then(() => {
  console.log('✅ Updated category 40 size guide image');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
