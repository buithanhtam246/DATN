const mysql = require('mysql2/promise');
const dbConfig = require('./config_admin/db.config');

async function checkAddressesTable() {
  const pool = mysql.createPool({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const connection = await pool.getConnection();
    
    // Get table structure
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'addresses'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.DB]);
    
    console.log('📋 Cấu trúc bảng addresses:');
    console.table(columns);
    
    // Get sample data
    const [sampleData] = await connection.query('SELECT * FROM addresses LIMIT 3');
    console.log('\n📊 Dữ liệu mẫu:');
    console.table(sampleData);
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

checkAddressesTable();
