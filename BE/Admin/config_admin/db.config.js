// backend/config/db.config.js
require('dotenv').config(); // Load biến môi trường từ file .env

module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "", // Mật khẩu mặc định của XAMPP thường là rỗng
  DB: process.env.DB_NAME || "DATN", // Tên database mình đã chốt
  dialect: "mysql",
  pool: {
    max: 5,     // Số lượng kết nối tối đa
    min: 0,     // Số lượng kết nối tối thiểu
    acquire: 30000, // Thời gian tối đa để chờ kết nối (ms)
    idle: 10000     // Thời gian tối đa kết nối rảnh rỗi trước khi đóng
  }
};