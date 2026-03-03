const express = require('express');
require('dotenv').config();
const path = require('path');

const { sequelize, testConnection } = require('./config/database');
const User = require('./Users/model/user.model');
const authRouter = require('./Users/router/auth.router');

const app = express();
app.use(express.json());

// Serve static files (simple frontend for testing)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Route chính
app.get('/', (req, res) => {
  res.json({
    message: '🎉 Chào mừng đến Backend DATN',
    status: 'Server đang chạy',
    version: '1.0.0',
    endpoints: {
      register: '/api/auth/register - Đăng ký',
      login: '/api/auth/login - Đăng nhập',
      health: '/api/health - Kiểm tra trạng thái'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server đang hoạt động bình thường',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.use('/api/auth', authRouter);

// Khởi tạo kết nối database
const initializeDatabase = async () => {
  try {
    // Test kết nối
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Không thể kết nối đến database');
    }

    // Đồng bộ hóa các models
    console.log('📊 Đang đồng bộ models với database...');
    await sequelize.sync({ alter: false });
    console.log('✅ Đồng bộ models thành công!');

  } catch (error) {
    console.error('❌ Lỗi khởi tạo database:', error.message);
    process.exit(1);
  }
};

// Khởi động server
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Server running at: http://localhost:${process.env.PORT || 3000}`);
  });
};

startServer();