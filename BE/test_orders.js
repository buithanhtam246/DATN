const { sequelize } = require('./config/database');

async function testOrders() {
  try {
    const data = await sequelize.query(`
      SELECT 
        o.id,
        o.id as order_number,
        (SELECT CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')) FROM users WHERE id = o.user_id LIMIT 1) as customer_name,
        o.total_price,
        o.status,
        o.create_at as created_at
      FROM orders o
      ORDER BY o.create_at DESC
      LIMIT 10
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('Recent orders:', JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testOrders();
