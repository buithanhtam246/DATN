const pool = require('./Admin/config/db');

pool.getConnection().then(conn => {
  conn.query('SELECT id, parent_id, name, status FROM categories ORDER BY id')
    .then(([rows]) => {
      console.log('=== CATEGORIES TABLE ===');
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
