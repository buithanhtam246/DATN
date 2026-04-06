const { sequelize } = require('./config/database');

async function checkProductDetail() {
  try {
    // Lấy sản phẩm chi tiết
    const [product] = await sequelize.query(`
      SELECT 
        p.id, 
        p.name, 
        p.image, 
        p.category_id, 
        p.brand_id,
        c.name as category_name,
        b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brand b ON p.brand_id = b.id
      WHERE p.id = 24
      LIMIT 1
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('Product:', JSON.stringify(product, null, 2));

    if (product && product.id) {
      const [variants] = await sequelize.query(`
        SELECT id, color_id, size_id, price, price_sale, quantity, image
        FROM variant
        WHERE product_id = ?
      `, { 
        replacements: [product.id],
        type: sequelize.QueryTypes.SELECT 
      });

      console.log('\nVariants:', JSON.stringify(variants, null, 2));
      console.log('Total variants:', variants.length);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkProductDetail();
