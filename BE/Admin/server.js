const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { sequelize } = require('../config/database');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// body parser for JSON
app.use(express.json());

// serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Sync database models
sequelize.sync().then(() => {
  console.log('✅ Đồng bộ models thành công!');
}).catch(err => {
  console.error('❌ Lỗi đồng bộ models:', err);
});

// admin routers (to be created under router_admin)
const orderAdminRouter = require('./router_admin/order.admin.router');
const voucherAdminRouter = require('./router_admin/voucher.admin.router');
const productAdminRouter = require('./router_admin/product.routes');
const categoryAdminRouter = require('./router_admin/category.routes');
const brandAdminRouter = require('./repository_admin/brand.routes');

// mount admin routes
app.use('/admin', orderAdminRouter);
app.use('/admin/vouchers', voucherAdminRouter);
app.use('/admin/products', productAdminRouter);
app.use('/admin/categories', categoryAdminRouter);
app.use('/admin/brands', brandAdminRouter);

app.get('/', (req, res) => {
  res.send('Backend đang chạy cực mượt!');
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});