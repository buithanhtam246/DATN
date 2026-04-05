const { sequelize } = require('./config/database');

async function updateProduct46() {
  try {
    // Update product 46 with image array
    const images = [
      'product-1775138630913-761732871.jpg',
      'product-test-2.jpg',
      'product-test-3.jpg'
    ];

    const result = await sequelize.query(`
      UPDATE products 
      SET images = ? 
      WHERE id = 46
    `, {
      replacements: [JSON.stringify(images)],
      type: sequelize.QueryTypes.UPDATE
    });

    console.log('✅ Updated product 46 with images array');
    console.log('Images stored:', JSON.stringify(images, null, 2));

    // Verify the update
    const product = await sequelize.query(`
      SELECT id, name, image, images FROM products WHERE id = 46
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\nVerification:');
    console.log(JSON.stringify(product[0], null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateProduct46();
