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

/**
 * Doanh thu theo ngày / tháng / năm (dữ liệu thật từ bảng orders)
 * Query:
 * - groupBy: 'day' | 'month' | 'year' (default: 'month')
 * - year: number (default: current year)
 * - month: 1..12 (required when groupBy=day; default: current month)
 * - startYear/endYear (optional when groupBy=year; default: last 5 years)
 */
exports.getRevenueSeries = async (req, res) => {
    try {
        const now = new Date();
        const groupByRaw = (req.query.groupBy || req.query.group_by || 'month').toString();
        const groupBy = ['day', 'month', 'year'].includes(groupByRaw) ? groupByRaw : 'month';

        const year = parseInt((req.query.year || now.getFullYear()).toString(), 10);
        const month = parseInt((req.query.month || (now.getMonth() + 1)).toString(), 10);

        let labels = [];
        let values = [];

        if (groupBy === 'month') {
            const rows = await sequelize.query(
                `SELECT MONTH(o.create_at) AS period, SUM(o.total_price) AS revenue
                 FROM orders o
                 WHERE o.status != 'cancelled' AND YEAR(o.create_at) = ?
                 GROUP BY MONTH(o.create_at)
                 ORDER BY period ASC`,
                {
                    replacements: [year],
                    type: sequelize.QueryTypes.SELECT
                }
            );

            labels = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}/${year}`);
            const map = new Map(rows.map(r => [Number(r.period), Number(r.revenue || 0)]));
            values = Array.from({ length: 12 }, (_, i) => map.get(i + 1) || 0);
        }

        if (groupBy === 'day') {
            const safeMonth = Math.min(12, Math.max(1, month));
            const daysInMonth = new Date(year, safeMonth, 0).getDate();
            const rows = await sequelize.query(
                `SELECT DAY(o.create_at) AS period, SUM(o.total_price) AS revenue
                 FROM orders o
                 WHERE o.status != 'cancelled' AND YEAR(o.create_at) = ? AND MONTH(o.create_at) = ?
                 GROUP BY DAY(o.create_at)
                 ORDER BY period ASC`,
                {
                    replacements: [year, safeMonth],
                    type: sequelize.QueryTypes.SELECT
                }
            );

            labels = Array.from({ length: daysInMonth }, (_, i) => `${String(i + 1).padStart(2, '0')}/${String(safeMonth).padStart(2, '0')}/${year}`);
            const map = new Map(rows.map(r => [Number(r.period), Number(r.revenue || 0)]));
            values = Array.from({ length: daysInMonth }, (_, i) => map.get(i + 1) || 0);
        }

        if (groupBy === 'year') {
            const endYear = parseInt((req.query.endYear || req.query.end_year || year || now.getFullYear()).toString(), 10);
            const startYear = parseInt((req.query.startYear || req.query.start_year || (endYear - 4)).toString(), 10);
            const safeStart = Math.min(startYear, endYear);
            const safeEnd = Math.max(startYear, endYear);

            const rows = await sequelize.query(
                `SELECT YEAR(o.create_at) AS period, SUM(o.total_price) AS revenue
                 FROM orders o
                 WHERE o.status != 'cancelled' AND YEAR(o.create_at) BETWEEN ? AND ?
                 GROUP BY YEAR(o.create_at)
                 ORDER BY period ASC`,
                {
                    replacements: [safeStart, safeEnd],
                    type: sequelize.QueryTypes.SELECT
                }
            );

            labels = Array.from({ length: (safeEnd - safeStart + 1) }, (_, i) => `${safeStart + i}`);
            const map = new Map(rows.map(r => [Number(r.period), Number(r.revenue || 0)]));
            values = labels.map(l => map.get(Number(l)) || 0);
        }

        return res.status(200).json({
            success: true,
            data: {
                groupBy,
                labels,
                values,
                currency: 'VND',
                meta: {
                    year,
                    month,
                }
            }
        });
    } catch (error) {
        console.error('❌ Error getting revenue series:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi lấy doanh thu: ' + error.message,
            data: { labels: [], values: [] }
        });
    }
};
