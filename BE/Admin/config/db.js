const mysql = require('mysql2/promise');
const dbConfig = require('../config_admin/db.config');

const pool = mysql.createPool({
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true,
  connectionLimit: dbConfig.pool.max || 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  // Prefer socketPath when provided (e.g., XAMPP on macOS); otherwise use host/port
  ...(process.env.DB_SOCKET
    ? { socketPath: process.env.DB_SOCKET }
    : { host: dbConfig.HOST, port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306 })
});

module.exports = pool;
