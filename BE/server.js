const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');

const app = express();

// --- 1. MIDDLEWARES (PHẢI ĐẶT TRƯỚC ROUTER) ---
app.use(cors({ origin: true, credentials: true }));
// Hai dòng này cực kỳ quan trọng để đọc dữ liệu từ Postman
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use('/public', express.static(path.join(__dirname, 'public')));

// --- 2. HÀM NẠP MODEL THÔNG MINH ---
const loadModel = (modelPath) => {
    try {
        const model = require(modelPath);
        if (typeof model === 'function' && !(model.prototype instanceof require('sequelize').Model)) {
            return model(sequelize);
        }
        return model;
    } catch (e) {
        return null;
    }
};

// --- 3. KHỞI TẠO MODELS ---
const models = {
    Product: loadModel('./Admin/model/product.model'),
    News: loadModel('./Admin/model/news.model'),
    ProductVariant: loadModel('./Users/model/ProductVariant.model'),
    User: loadModel('./Users/model/user.model'),
    Address: loadModel('./Users/model/address.model'),
    Voucher: loadModel('./Users/model/Voucher.model'),
    PaymentMethod: loadModel('./Users/model/PaymentMethod.model'),
    Cart: loadModel('./Users/model/Cart.model'),
    CartItem: loadModel('./Users/model/CartItem.model'),
    Order: loadModel('./Users/model/Order.model'),
    OrderDetail: loadModel('./Users/model/OrderDetail.model'),
    OrderReview: loadModel('./Users/model/Review.model')
    ,
    Favorite: loadModel('./Users/model/Favorite.model')
};
Object.assign(sequelize.models, models);

// Thiết lập quan hệ
if (models.Product && models.ProductVariant) {
    models.Product.hasMany(models.ProductVariant, { foreignKey: 'product_id', as: 'variants' });
    models.ProductVariant.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
}

Object.values(models).forEach(model => {
    if (model && typeof model.associate === 'function') {
        try { model.associate(models); } catch (err) {}
    }
});

// --- 4. TẤT CẢ ROUTERS (ĐẶT SAU MIDDLEWARE) ---
app.use('/api/auth', require('./Users/router/auth.router'));
app.use('/api/users', require('./Users/router/user.router'));
app.use('/api/products', require('./Users/router/product.router'));
app.use('/api/size-guides', require('./Users/router/size-guide.router'));
app.use('/api/addresses', require('./Users/router/address.router'));
app.use('/api/vouchers', require('./Users/router/voucher.router'));
app.use('/api/cart', require('./Users/router/cart.router'));
app.use('/api/favorites', require('./Users/router/favorite.router'));
app.use('/api/payment-methods', require('./Users/router/paymentMethod.routes'));
app.use('/api/payments', require('./Users/router/payment.router'));
app.use('/api/orders', require('./Users/router/orderHistory.router'));
app.use('/api/orders', require('./Users/router/order.routes'));
app.use('/api/reviews', require('./Users/router/review.router'));

// Admin Routes
app.use('/api/auth/admin', require('./Admin/router_admin/admin-auth.routes'));
app.use('/api/admin/genders', require('./Admin/router_admin/gender.routes'));
app.use('/api/admin/brands', require('./Admin/router_admin/brand.routes'));
app.use('/api/admin/categories', require('./Admin/router_admin/category.routes'));
app.use('/api/admin/colors', require('./Admin/router_admin/color.routes'));
app.use('/api/admin/sizes', require('./Admin/router_admin/size.routes'));
app.use('/api/admin/orders', require('./Admin/router_admin/order.admin.router'));
app.use('/api/admin/vouchers', require('./Admin/router_admin/voucher.admin.router'));
app.use('/api/admin/users', require('./Admin/router_admin/user.admin.routes'));
app.use('/api/admin/dashboard', require('./Admin/router_admin/dashboard.routes'));
app.use('/api/admin/banners', require('./Admin/router_admin/banner.routes'));
app.use('/api/admin/news', require('./Admin/router_admin/news.routes'));
app.use('/api/admin', require('./Admin/router_admin/product.routes'));

// --- STATIC FILES ROUTES (PHẢI ĐẶT TRƯỚC API ROUTES) ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images/products', express.static(path.join(__dirname, 'public/images/products')));

// --- 5. KHỞI CHẠY ---
const startServer = async () => {
    try {
        await testConnection();
        await sequelize.sync({ alter: false }); 
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running at: http://localhost:${PORT}`);
            // Debug: print MoMo endpoint used at runtime to help verify env config
            try {
                const momoEndpoint = process.env.MOMO_ENDPOINT || '(not set)';
                const isSandbox = String(momoEndpoint).includes('test') || String(momoEndpoint).includes('sandbox');
                console.log('MoMo endpoint (runtime):', momoEndpoint, 'sandbox?', isSandbox);
            } catch (e) {
                console.log('MoMo endpoint: <error reading env>');
            }
        });
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }
};
startServer();