const { sequelize } = require('./config/database');

async function checkProducts() {
  try {
    const [products] = await sequelize.query(`
      SELECT id, name FROM products LIMIT 5
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('Products:', JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkProducts();
