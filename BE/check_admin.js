const { sequelize } = require('./config/database');

async function checkAdmin() {
  try {
    const [rows] = await sequelize.query("SELECT id, name, email, role FROM user WHERE role = 'admin' LIMIT 5");
    console.log('Admin users:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkAdmin();
