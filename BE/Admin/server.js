const express = require('express');
const dotenv = require('dotenv');
const { sequelize } = require('../config/database');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// body parser for JSON
app.use(express.json());

// Sync database models
sequelize.sync().then(() => {
  console.log('✅ Đồng bộ models thành công!');
}).catch(err => {
  console.error('❌ Lỗi đồng bộ models:', err);
});

// admin routers (to be created under router_admin)
const orderAdminRouter = require('./router_admin/order.admin.router');
const voucherAdminRouter = require('./router_admin/voucher.admin.router');

// mount admin routes
app.use('/admin', orderAdminRouter);
app.use('/admin/vouchers', voucherAdminRouter);

app.get('/', (req, res) => {
  res.send('Backend đang chạy cực mượt!');
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});