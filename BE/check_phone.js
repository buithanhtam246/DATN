const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'datn_shop'
    });

    // Check users
    console.log('\n=== Check User Phone ===');
    const [users] = await conn.query(`
      SELECT id, name, email, phone 
      FROM users 
      WHERE name LIKE '%Thanh%' OR email LIKE '%buithanhtam%'
      LIMIT 5
    `);
    console.log('Users:', users);

    // Check order #34
    console.log('\n=== Check Order #34 ===');
    const [order] = await conn.query(`
      SELECT o.id, o.user_id, o.delivery_address, u.id as uid, u.name, u.email, u.phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = 34
    `);
    console.log('Order:', order);

    await conn.end();
  } catch(e) {
    console.error('Error:', e.message);
  }
})();
