const { sequelize } = require('./config/database');

async function checkImages() {
  try {
    // Check if images column exists
    const columns = await sequelize.query(`
      SHOW COLUMNS FROM products
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('Columns in products table:');
    columns.forEach(col => {
      if (col.Field === 'image' || col.Field === 'images') {
        console.log(`  - ${col.Field}: ${col.Type}`);
      }
    });

    // Get product 46 with all columns
    const product = await sequelize.query(`
      SELECT * FROM products WHERE id = 46
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('\nProduct 46 data:');
    if (product.length > 0) {
      console.log(JSON.stringify(product[0], null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkImages();
