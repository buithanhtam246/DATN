const db = require("../config/db");

exports.getAllUsers = async () => {
    let connection;
    try {
        console.log("📍 Service: Bắt đầu lấy danh sách người dùng...");
        
        connection = await db.getConnection();
        console.log("✅ Service: Kết nối DB thành công");
        
        const sql = `
            SELECT id, name, email, phone, role 
            FROM users 
            ORDER BY id DESC
        `;
        console.log("🔍 Service: Thực thi query");
        
        const [rows] = await connection.query(sql);
        console.log("✅ Service: Lấy dữ liệu thành công, số lượng:", rows.length);

        const result = rows.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }));
        
        console.log("📤 Service: Trả về kết quả");
        return result;
    } catch (error) {
        console.error("❌ Lỗi Service User - getAllUsers:", error.message);
        throw error;
    } finally {
        if (connection) {
            connection.release();
            console.log("🔌 Service: Đóng kết nối");
        }
    }
};

exports.getUserById = async (id) => {
    let connection;
    try {
        connection = await db.getConnection();
        const sql = `SELECT * FROM users WHERE id = ?`;
        const [rows] = await connection.query(sql, [id]);
        
        if (rows.length === 0) {
            return null;
        }
        
        const user = rows[0];
        return {
            ...user,
            status: user.status === 1 ? 'active' : 'inactive'
        };
    } catch (error) {
        console.error("❌ Lỗi Service User - getUserById:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};

exports.updateUser = async (id, userData) => {
    let connection;
    try {
        connection = await db.getConnection();
        const { name, email, phone, address, status } = userData;
        
        const sql = `UPDATE users SET name = ?, email = ?, phone = ?, address = ?, status = ? WHERE id = ?`;
        const [result] = await connection.query(sql, [name, email, phone, address, status || 1, id]);
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return await exports.getUserById(id);
    } catch (error) {
        console.error("❌ Lỗi Service User - updateUser:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};

exports.deleteUser = async (id) => {
    let connection;
    try {
        connection = await db.getConnection();
        const sql = `DELETE FROM users WHERE id = ?`;
        const [result] = await connection.query(sql, [id]);
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error("❌ Lỗi Service User - deleteUser:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};
