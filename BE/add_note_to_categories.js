const { sequelize } = require('./config/database');

async function run() {
  try {
    const [columns] = await sequelize.query(`SHOW COLUMNS FROM categories LIKE 'note'`);

    if (Array.isArray(columns) && columns.length > 0) {
      console.log('ℹ️ Column categories.note already exists');
      return;
    }

    await sequelize.query(`ALTER TABLE categories ADD COLUMN note TEXT NULL AFTER size_guide_image_url`);
    console.log('✅ Added categories.note column');
  } catch (error) {
    console.error('❌ Failed to add categories.note:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
