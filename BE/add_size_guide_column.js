const pool = require('./Admin/config/db');

async function addSizeGuideColumn() {
  const conn = await pool.getConnection();
  
  try {
    console.log('Checking if size_guide_image_url column exists...');
    
    const [columns] = await conn.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'categories' AND COLUMN_NAME = 'size_guide_image_url'
    `);

    if (columns.length > 0) {
      console.log('✅ Column already exists');
      conn.release();
      process.exit(0);
      return;
    }

    console.log('Adding size_guide_image_url column...');
    await conn.query(`
      ALTER TABLE \`categories\` 
      ADD COLUMN \`size_guide_image_url\` varchar(255) NULL COMMENT 'Ảnh hướng dẫn kích thước cho danh mục'
    `);
    console.log('✅ Column added successfully');

    // Show updated structure
    const [updatedColumns] = await conn.query(`
      SELECT 
        COLUMN_NAME, 
        COLUMN_TYPE, 
        IS_NULLABLE, 
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'categories' 
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n=== UPDATED CATEGORIES TABLE STRUCTURE ===');
    console.log(JSON.stringify(updatedColumns, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
}

addSizeGuideColumn();
