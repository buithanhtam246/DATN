const { sequelize } = require('./config/database');

async function run() {
  try {
    console.log('🔍 Checking image columns in categories and size tables...');

    const [categoryColumns] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'categories'
        AND COLUMN_NAME IN ('size_guide_image_url', 'image_url')
    `);

    const [sizeColumns] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'size'
        AND COLUMN_NAME IN ('image_url', 'size_image_url')
    `);

    const hasCategoryGuideImage = categoryColumns.some((col) => col.COLUMN_NAME === 'size_guide_image_url');
    const hasSizeImage = sizeColumns.some((col) => col.COLUMN_NAME === 'image_url');
    const hasSizeImageNew = sizeColumns.some((col) => col.COLUMN_NAME === 'size_image_url');

    console.log(`- categories.size_guide_image_url: ${hasCategoryGuideImage ? '✅' : '❌'}`);
    console.log(`- size.image_url (legacy): ${hasSizeImage ? '✅' : '❌'}`);
    console.log(`- size.size_image_url (new): ${hasSizeImageNew ? '✅' : '❌'}`);

    if (!hasSizeImage) {
      console.log('ℹ️ Không tìm thấy size.image_url, bỏ qua bước tách cột.');
      return;
    }

    if (!hasSizeImageNew) {
      console.log('🛠️ Creating size.size_image_url...');
      await sequelize.query(`
        ALTER TABLE size
        ADD COLUMN size_image_url VARCHAR(255) NULL COMMENT 'Ảnh riêng cho size' AFTER image_url
      `);
      console.log('✅ Created size.size_image_url');
    }

    console.log('🔄 Migrating old values from size.image_url to size.size_image_url...');
    const [result] = await sequelize.query(`
      UPDATE size
      SET size_image_url = image_url
      WHERE size_image_url IS NULL
        AND image_url IS NOT NULL
    `);

    console.log(`✅ Migrated rows: ${result.affectedRows || 0}`);
    console.log('🎉 Done. Categories and Size now use separate image columns.');
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
