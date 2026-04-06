const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DATN'
    });

    const [rows] = await connection.execute('DESCRIBE users');
    console.log('\n=== USERS TABLE STRUCTURE ===\n');
    rows.forEach(row => {
      console.log(`Column: ${row.Field}`);
      console.log(`  Type: ${row.Type}`);
      console.log(`  Null: ${row.Null}`);
      console.log(`  Key: ${row.Key || 'None'}`);
      console.log(`  Default: ${row.Default || 'None'}`);
      console.log(`  Extra: ${row.Extra || 'None'}`);
      console.log('');
    });

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
