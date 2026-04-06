const db = require("../config/db");

exports.getAllOrders = async () => {
    let connection;
    try {
        console.log("📍 Service: Bắt đầu lấy danh sách đơn hàng...");
        
        connection = await db.getConnection();
        console.log("✅ Service: Kết nối DB thành công");
        
        const sql = `
            SELECT 
                o.id,
                o.user_id,
                o.address_id,
                o.total_price,
                o.status,
                o.create_at,
                o.payment_method,
                MAX(u.name) as user_name,
                MAX(u.email) as user_email,
                COALESCE(MAX(u.phone), MAX(COALESCE(a.receiver_phone, da.receiver_phone))) as phone,
                COALESCE(MAX(a.full_address), MAX(o.delivery_address), MAX(da.full_address)) as address,
                GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') as product_names,
                COUNT(DISTINCT od.id) as product_count
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN addresses a ON o.address_id = a.id
            LEFT JOIN addresses da ON o.user_id = da.user_id AND da.is_default = 1
            LEFT JOIN order_details od ON o.id = od.order_id
            LEFT JOIN variant v ON od.variant_id = v.id
            LEFT JOIN products p ON v.product_id = p.id
            GROUP BY o.id, o.user_id, o.address_id, o.total_price, o.status, o.create_at, o.payment_method
            ORDER BY o.id DESC
        `;
        console.log("🔍 Service: Thực thi query");
        
        const [rows] = await connection.query(sql);
        console.log("✅ Service: Lấy dữ liệu thành công, số lượng:", rows.length);

        const result = rows.map(order => ({
            id: order.id,
            user_id: order.user_id,
            customerName: order.user_name,
            email: order.user_email,
            phone: order.phone,
            address: order.address,
            total_price: order.total_price,
            totalPrice: order.total_price,
            status: order.status,
            paymentMethod: order.payment_method,
            created_at: order.create_at,
            productNames: order.product_names || 'N/A',
            productCount: order.product_count || 0
        }));
        
        console.log("📤 Service: Trả về kết quả");
        return result;
    } catch (error) {
        console.error("❌ Lỗi Service Order - getAllOrders:", error.message);
        throw error;
    } finally {
        if (connection) {
            connection.release();
            console.log("🔌 Service: Đóng kết nối");
        }
    }
};

exports.getOrderById = async (id) => {
    let connection;
    try {
        connection = await db.getConnection();
        const sql = `
            SELECT 
                o.id,
                o.user_id,
                o.address_id,
                o.total_price,
                o.delivery_cost,
                o.status,
                o.create_at,
                o.delivery_address,
                o.payment_method,
                MAX(u.name) as user_name,
                MAX(u.email) as user_email,
                COALESCE(MAX(u.phone), MAX(COALESCE(a.receiver_phone, da.receiver_phone))) as phone,
                COALESCE(MAX(a.full_address), MAX(o.delivery_address), MAX(da.full_address)) as address,
                GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') as product_names,
                COUNT(DISTINCT od.id) as product_count
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN addresses a ON o.address_id = a.id
            LEFT JOIN addresses da ON o.user_id = da.user_id AND da.is_default = 1
            LEFT JOIN order_details od ON o.id = od.order_id
            LEFT JOIN variant v ON od.variant_id = v.id
            LEFT JOIN products p ON v.product_id = p.id
            WHERE o.id = ?
            GROUP BY o.id, o.user_id, o.address_id, o.total_price, o.delivery_cost, o.status, o.create_at, o.delivery_address, o.payment_method
        `;
        const [rows] = await connection.query(sql, [id]);
        
        if (rows.length === 0) {
            return null;
        }

        const itemSql = `
            SELECT
                od.id,
                od.order_id,
                od.variant_id,
                od.quantity,
                od.price,
                p.id AS product_id,
                p.name AS product_name,
                p.image AS product_image,
                cat.name AS category_name,
                parent_cat.name AS parent_category_name,
                v.image AS variant_image,
                c.name AS color_name,
                c.hex_code AS color_code,
                s.size AS size_name
            FROM order_details od
            LEFT JOIN variant v ON od.variant_id = v.id
            LEFT JOIN products p ON v.product_id = p.id
            LEFT JOIN categories cat ON p.category_id = cat.id
            LEFT JOIN categories parent_cat ON cat.parent_id = parent_cat.id
            LEFT JOIN color c ON v.color_id = c.id
            LEFT JOIN size s ON v.size_id = s.id
            WHERE od.order_id = ?
            ORDER BY od.id ASC
        `;
        const [itemRows] = await connection.query(itemSql, [id]);
        
        const order = rows[0];
        return {
            id: order.id,
            user_id: order.user_id,
            customerName: order.user_name,
            email: order.user_email,
            phone: order.phone,
            address: order.address || 'Chưa có địa chỉ',
            total_price: order.total_price,
            totalPrice: order.total_price,
            deliveryCost: Number(order.delivery_cost || 0),
            status: order.status,
            paymentMethod: order.payment_method,
            created_at: order.create_at,
            productNames: order.product_names || 'N/A',
            productCount: order.product_count || itemRows.length || 0,
            items: itemRows.map((item) => ({
                id: item.id,
                order_id: item.order_id,
                variant_id: item.variant_id,
                quantity: Number(item.quantity || 0),
                price: Number(item.price || 0),
                product_id: item.product_id,
                product_name: item.product_name || 'Sản phẩm',
                category_name: item.category_name || 'N/A',
                parent_category_name: item.parent_category_name || '',
                image: item.variant_image || item.product_image || '',
                color_name: item.color_name || '',
                color_code: item.color_code || '',
                size_name: item.size_name ?? ''
            }))
        };
    } catch (error) {
        console.error("❌ Lỗi Service Order - getOrderById:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};

exports.updateOrderStatus = async (id, status) => {
    let connection;
    try {
        connection = await db.getConnection();
        const sql = `UPDATE orders SET status = ? WHERE id = ?`;
        const [result] = await connection.query(sql, [status, id]);
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return await exports.getOrderById(id);
    } catch (error) {
        console.error("❌ Lỗi Service Order - updateOrderStatus:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};

exports.deleteOrder = async (id) => {
    let connection;
    try {
        connection = await db.getConnection();
        const sql = `DELETE FROM orders WHERE id = ?`;
        const [result] = await connection.query(sql, [id]);
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error("❌ Lỗi Service Order - deleteOrder:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};
