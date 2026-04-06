const pool = require('./Admin/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const conn = await pool.getConnection();
  
  try {
    console.log('Dropping gender column from size table...');
    await conn.query('ALTER TABLE `size` DROP COLUMN `gender`');
    console.log('✅ Gender column dropped');

    console.log('Updating category_id comment...');
    await conn.query('ALTER TABLE `size` MODIFY COLUMN `category_id` int COMMENT "Danh mục cha (Nam, Nữ, Trẻ em, Unisex)"');
    console.log('✅ Category_id comment updated');

    console.log('Checking if foreign key exists...');
    const [fks] = await conn.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'size' AND COLUMN_NAME = 'category_id' AND REFERENCED_TABLE_NAME = 'categories'
    `);

    if (fks.length === 0) {
      console.log('Adding foreign key constraint...');
      await conn.query(`
        ALTER TABLE \`size\` ADD CONSTRAINT \`fk_size_category\` 
        FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE CASCADE
      `);
      console.log('✅ Foreign key constraint added');
    } else {
      console.log('✅ Foreign key constraint already exists');
    }

    console.log('\n=== MIGRATION COMPLETED SUCCESSFULLY ===');
    
    // Show updated table structure
    const [columns] = await conn.query(`
      SELECT 
        COLUMN_NAME, 
        COLUMN_TYPE, 
        IS_NULLABLE, 
        COLUMN_KEY, 
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'size' 
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\nUpdated Size Table Structure:');
    console.log(JSON.stringify(columns, null, 2));

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
}

runMigration();
