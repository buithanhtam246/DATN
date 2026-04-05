const { sequelize } = require('./config/database');

async function checkCartItems() {
  try {
    // Kiểm tra cart items tham chiếu đến product #2
    const [items] = await sequelize.query(`
      SELECT ci.id, ci.variant_id, v.id as variant_id_check, v.product_id
      FROM cart_item ci
      LEFT JOIN variant v ON ci.variant_id = v.id
      WHERE v.product_id = 2
    `);
    
    console.log('Cart items liên quan đến product #2:');
    console.log(JSON.stringify(items, null, 2));
    
    if (items.length > 0) {
      console.log('\nXóa những cart items này...');
      await sequelize.query(`
        DELETE FROM cart_item
        WHERE variant_id IN (
          SELECT id FROM variant WHERE product_id = 2
        )
      `);
      console.log('✅ Đã xóa cart items');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkCartItems();
