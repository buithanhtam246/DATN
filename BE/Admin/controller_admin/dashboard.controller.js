const { sequelize } = require('../../config/database');

/**
 * Lấy top products bán chạy nhất từ order details
 */
exports.getTopSellingProducts = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const data = await sequelize.query(`
            SELECT 
                p.id,
                p.name,
                p.image,
                p.brand_id,
                p.category_id,
                (SELECT name FROM brand WHERE id = p.brand_id LIMIT 1) as brand_name,
                (SELECT name FROM categories WHERE id = p.category_id LIMIT 1) as category_name,
                MIN(v.price) as price,
                MIN(CASE WHEN v.price_sale > 0 THEN v.price_sale ELSE NULL END) as price_sale,
                COUNT(DISTINCT od.id) as total_sold,
                SUM(od.quantity) as total_quantity,
                SUM(od.quantity * od.price) as total_revenue
            FROM order_details od
            JOIN variant v ON od.variant_id = v.id
            JOIN products p ON v.product_id = p.id
            GROUP BY p.id, p.name, p.image, p.brand_id, p.category_id
            ORDER BY total_sold DESC, total_revenue DESC
            LIMIT ?
        `, {
            replacements: [parseInt(limit)],
            type: sequelize.QueryTypes.SELECT
        });

        console.log('✅ Top selling products:', data);
        res.status(200).json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('❌ Error getting top selling products:', error);
        res.status(200).json({
            success: false,
            data: []
        });
    }
};

/**
 * Lấy dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await Promise.all([
            // Tổng doanh thu
            sequelize.query(`
                SELECT SUM(total_price) as total_revenue FROM orders WHERE status != 'cancelled'
            `, { type: sequelize.QueryTypes.SELECT }),
            
            // Tổng đơn hàng
            sequelize.query(`
                SELECT COUNT(id) as total_orders FROM orders WHERE status != 'cancelled'
            `, { type: sequelize.QueryTypes.SELECT }),
            
            // Tổng sản phẩm đã bán
            sequelize.query(`
                SELECT SUM(quantity) as total_items_sold FROM order_details
            `, { type: sequelize.QueryTypes.SELECT }),
            
            // Tổng khách hàng
            sequelize.query(`
                SELECT COUNT(DISTINCT user_id) as total_customers FROM orders
            `, { type: sequelize.QueryTypes.SELECT })
        ]);

        res.status(200).json({
            totalRevenue: stats[0][0]?.total_revenue || 0,
            totalOrders: stats[1][0]?.total_orders || 0,
            totalItemsSold: stats[2][0]?.total_items_sold || 0,
            totalCustomers: stats[3][0]?.total_customers || 0
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ message: "Lỗi lấy thống kê: " + error.message });
    }
};

/**
 * Lấy đơn hàng gần đây
 */
exports.getRecentOrders = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const data = await sequelize.query(`
            SELECT 
                o.id,
                o.id as order_number,
                (SELECT COALESCE(name, 'N/A') FROM users WHERE id = o.user_id LIMIT 1) as customer_name,
                o.total_price,
                o.status,
                o.create_at as created_at,
                o.create_at as updated_at
            FROM orders o
            ORDER BY o.create_at DESC
            LIMIT ?
        `, {
            replacements: [parseInt(limit)],
            type: sequelize.QueryTypes.SELECT
        });

        console.log('✅ Recent orders:', data);
        res.status(200).json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('❌ Error getting recent orders:', error);
        res.status(200).json({
            success: false,
            data: []
        });
    }
};
