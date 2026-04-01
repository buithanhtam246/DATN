const { sequelize } = require('../../config/database');

/**
 * Lấy top products bán chạy nhất từ order details
 */
exports.getTopSellingProducts = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const data = await sequelize.query(`
            SELECT 
                p.id,
                p.name,
                p.image,
                p.brand_id,
                (SELECT name FROM brand WHERE id = p.brand_id LIMIT 1) as brand_name,
                pv.price,
                pv.price_sale,
                COUNT(od.id) as total_sold,
                SUM(od.quantity) as total_quantity,
                SUM(od.quantity * od.price) as total_revenue
            FROM order_details od
            JOIN product_variant pv ON od.product_variant_id = pv.id
            JOIN products p ON pv.product_id = p.id
            GROUP BY p.id, p.name, p.image, p.brand_id, pv.price, pv.price_sale
            ORDER BY total_sold DESC, total_revenue DESC
            LIMIT ?
        `, {
            replacements: [parseInt(limit)],
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json(data || []);
    } catch (error) {
        console.error('Error getting top selling products:', error);
        // Return empty array if table doesn't exist or no data
        res.status(200).json([]);
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
                o.order_number,
                (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE id = o.user_id LIMIT 1) as customer_name,
                o.total_price,
                o.status,
                o.created_at,
                o.updated_at
            FROM order o
            ORDER BY o.created_at DESC
            LIMIT ?
        `, {
            replacements: [parseInt(limit)],
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json(data || []);
    } catch (error) {
        console.error('Error getting recent orders:', error);
        // Return empty array if table doesn't exist or no data
        res.status(200).json([]);
    }
};
