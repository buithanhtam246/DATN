const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors');

const { sequelize, testConnection } = require('./config/database');
const authRouter = require('./Users/router/auth.router');
const addressRouter = require('./Users/router/address.router');
const userRouter = require('./Users/router/user.router');
const voucherRouter = require('./Users/router/voucher.router');
const orderRouter = require('./Users/router/order.routes');
const orderHistoryRouter = require('./Users/router/orderHistory.router');
const cartRouter = require('./Users/router/cart.router');
const reviewRouter = require('./Users/router/review.router');
// load models so sequelize can sync them
const User = require('./Users/model/user.model');
const Address = require('./Users/model/address.model');
const Voucher = require('./Users/model/Voucher.model');
const PaymentMethod = require('./Users/model/PaymentMethod.model');
const ProductVariant = require('./Users/model/ProductVariant.model');
const Cart = require('./Users/model/Cart.model');
const CartItem = require('./Users/model/CartItem.model');
//-----
const Order = require('./Users/model/Order.model');
const OrderDetail = require('./Users/model/OrderDetail.model');
const OrderReview = require('./Users/model/Review.model');

// Một đơn hàng có nhiều chi tiết sản phẩm
Order.hasMany(OrderDetail, { foreignKey: 'order_id', as: 'details' });
OrderDetail.belongsTo(Order, { foreignKey: 'order_id' });

// Một chi tiết đơn hàng có một đánh giá
OrderDetail.hasOne(OrderReview, { foreignKey: 'order_detail_id', as: 'order_detail' });
OrderReview.belongsTo(OrderDetail, { foreignKey: 'order_detail_id', as: 'order_detail' });

// Một đơn hàng thuộc một phương thức thanh toán
Order.belongsTo(PaymentMethod, { foreignKey: 'payment_method_id', as: 'paymentMethod' });
PaymentMethod.hasMany(Order, { foreignKey: 'payment_method_id' });

// Một đơn hàng có một voucher
Order.belongsTo(Voucher, { foreignKey: 'voucher_id', as: 'voucher' });
Voucher.hasMany(Order, { foreignKey: 'voucher_id' });

// Một đơn hàng thuộc một địa chỉ
Order.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
Address.hasMany(Order, { foreignKey: 'address_id' });

// Một chi tiết đơn hàng thuộc một variant sản phẩm
OrderDetail.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
ProductVariant.hasMany(OrderDetail, { foreignKey: 'variant_id' });

// Cart associations
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });
//---
const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:4200', 'http://localhost:4201', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

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

// User routes
app.use('/api/users', userRouter);

// Address book routes (require authentication internally)
app.use('/api/addresses', addressRouter);

// Voucher routes
app.use('/api/vouchers', voucherRouter);

// Cart routes (không cần authentication)
app.use('/api/cart', cartRouter);

// Order History routes (phải trước Order routes để /history được match trước)
app.use('/api/orders', orderHistoryRouter);

// Order routes
app.use('/api/orders', orderRouter);

// Review routes
app.use('/api/reviews', reviewRouter);

// Debug endpoint - tạm thời để kiểm tra đơn hàng
app.get('/api/debug/orders', async (req, res) => {
  try {
    const orders = await sequelize.sequelize.query(
      `SELECT o.id, o.user_id, o.total_price, o.status, o.create_at FROM orders o ORDER BY o.create_at DESC`,
      { type: sequelize.sequelize.QueryTypes.SELECT }
    );
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Khởi tạo kết nối database
const initializeDatabase = async () => {
  try {
    // Test kết nối
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Không thể kết nối đến database');
    }

    // Thiết lập associations giữa các model (nếu có)
    if (typeof User.associate === 'function') {
      User.associate({ Address, User });
    }
    if (typeof Address.associate === 'function') {
      Address.associate({ User, Address });
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