const { sequelize } = require('./config/database');

async function deleteProduct() {
  try {
    console.log('🔄 Deleting product #2...');
    
    // Xóa cart items
    const [deletedItems] = await sequelize.query(`
      DELETE FROM cart_item
      WHERE variant_id IN (
        SELECT id FROM variant WHERE product_id = 2
      )
    `);
    console.log('✅ Deleted cart items');
    
    // Xóa variants
    const [deletedVariants] = await sequelize.query(`
      DELETE FROM variant
      WHERE product_id = 2
    `);
    console.log('✅ Deleted variants');
    
    // Xóa product
    const [deletedProduct] = await sequelize.query(`
      DELETE FROM products
      WHERE id = 2
    `);
    console.log('✅ Deleted product #2');
    
    console.log('\n✅ Product deleted successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit(0);
  }
}

deleteProduct();
