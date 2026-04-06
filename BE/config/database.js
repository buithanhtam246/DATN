const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbOptions = {
  dialect: 'mysql',
  logging: false,
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: false,
  }
};

if (process.env.DB_SOCKET) {
  dbOptions.dialectOptions = {
    socketPath: process.env.DB_SOCKET,
  };
} else {
  dbOptions.host = process.env.DB_HOST || 'localhost';
  dbOptions.port = process.env.DB_PORT || 3306;
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'DATN',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  dbOptions
);

// Test kết nối database
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};