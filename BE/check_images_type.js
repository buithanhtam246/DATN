const { sequelize } = require('./config/database');

async function checkImages() {
  try {
    const result = await sequelize.query(`
      SELECT id, images FROM products WHERE id = 46
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('Raw data:');
    console.log('images value:', result[0].images);
    console.log('images type:', typeof result[0].images);
    console.log('images instanceof Array:', Array.isArray(result[0].images));
    
    if (typeof result[0].images === 'string') {
      console.log('\n✅ images is string, trying to parse...');
      const parsed = JSON.parse(result[0].images);
      console.log('Parsed result:', parsed);
      console.log('Is array:', Array.isArray(parsed));
    } else if (Array.isArray(result[0].images)) {
      console.log('\n✅ images is already array');
      console.log('Content:', result[0].images);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkImages();
