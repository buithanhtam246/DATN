const mysql = require('mysql2/promise');
const dbConfig = require('../config_admin/db.config');

const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true,
  connectionLimit: dbConfig.pool.max || 10,
  queueLimit: 0,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  charset: 'utf8mb4'
});

module.exports = pool;
