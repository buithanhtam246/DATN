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
                u.name as user_name,
                u.email as user_email,
                a.full_address as address
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN addresses a ON o.address_id = a.id
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
            address: order.address,
            total_price: order.total_price,
            totalPrice: order.total_price,
            status: order.status,
            create_at: order.create_at
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
                o.*,
                u.name as user_name,
                u.email as user_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `;
        const [rows] = await connection.query(sql, [id]);
        
        if (rows.length === 0) {
            return null;
        }
        
        return rows[0];
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
