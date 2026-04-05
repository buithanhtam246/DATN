const { sequelize } = require('./config/database');

async function checkTables() {
  try {
    const [rows] = await sequelize.query("SHOW TABLES;");
    console.log('Available tables:', rows.map(r => Object.values(r)[0]));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkTables();
