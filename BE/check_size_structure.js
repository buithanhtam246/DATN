const pool = require('./Admin/config/db');

pool.getConnection().then(conn => {
  conn.query(`
    SELECT 
      COLUMN_NAME, 
      COLUMN_TYPE, 
      IS_NULLABLE, 
      COLUMN_KEY, 
      EXTRA,
      COLUMN_COMMENT
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'size' 
    ORDER BY ORDINAL_POSITION
  `)
    .then(([rows]) => {
      console.log('=== SIZE TABLE STRUCTURE ===');
      console.log(JSON.stringify(rows, null, 2));
      conn.release();
      process.exit(0);
    })
    .catch(err => {
      console.error('Query error:', err);
      conn.release();
      process.exit(1);
    });
}).catch(err => {
  console.error('Connection error:', err);
  process.exit(1);
});
