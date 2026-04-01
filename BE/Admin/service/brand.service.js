const db = require("../config/db"); // Đảm bảo file kết nối DB đúng

exports.getAllBrands = async () => {
    let connection;
    try {
        console.log("📍 Service: Bắt đầu lấy danh sách brand...");
        
        // Lấy kết nối từ pool
        connection = await db.getConnection();
        console.log("✅ Service: Kết nối DB thành công");
        
        // Truy vấn đúng 3 cột id, name, status từ bảng brand
        const sql = `SELECT id, name, status FROM brand ORDER BY id DESC`;
        console.log("🔍 Service: Thực thi query:", sql);
        
        const [rows] = await connection.query(sql);
        console.log("✅ Service: Lấy dữ liệu thành công, số lượng:", rows.length);

        // Trả về dữ liệu đã được format cho Angular
        const result = rows.map(brand => ({
            id: brand.id,
            name: brand.name,
            // Chuyển tinyint status thành chuỗi trạng thái cho UI
            status: brand.status === 1 ? 'active' : 'inactive'
        }));
        
        console.log("📤 Service: Trả về kết quả:", result);
        return result;
    } catch (error) {
        console.error("❌ Lỗi Service Brand - getAllBrands:", error.message);
        console.error("❌ Chi tiết lỗi:", error);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
            console.log("🔌 Service: Đóng kết nối");
        }
    }
};

exports.createBrand = async (name, status) => {
    let connection;
    try {
        console.log("📍 Service: Bắt đầu thêm brand mới...");
        
        connection = await db.getConnection();
        console.log("✅ Service: Kết nối DB thành công");
        
        const statusValue = status === 'active' ? 1 : 0;
        const sql = `INSERT INTO brand (name, status) VALUES (?, ?)`;
        
        console.log("🔍 Service: Thực thi query:", sql);
        console.log("   Params:", [name, statusValue]);
        
        const [result] = await connection.query(sql, [name, statusValue]);
        
        console.log("✅ Service: Thêm brand thành công, ID:", result.insertId);
        return {
            id: result.insertId,
            name: name,
            status: status
        };
    } catch (error) {
        console.error("❌ Lỗi Service Brand - createBrand:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
            console.log("🔌 Service: Đóng kết nối");
        }
    }
};

exports.updateBrand = async (id, name, status) => {
    let connection;
    try {
        console.log("📍 Service: Bắt đầu cập nhật brand...");
        
        connection = await db.getConnection();
        console.log("✅ Service: Kết nối DB thành công");
        
        const statusValue = status === 'active' ? 1 : 0;
        const sql = `UPDATE brand SET name = ?, status = ? WHERE id = ?`;
        
        console.log("🔍 Service: Thực thi query:", sql);
        console.log("   Params:", [name, statusValue, id]);
        
        const [result] = await connection.query(sql, [name, statusValue, id]);
        
        console.log("✅ Service: Cập nhật brand thành công, affected rows:", result.affectedRows);
        return {
            id: id,
            name: name,
            status: status
        };
    } catch (error) {
        console.error("❌ Lỗi Service Brand - updateBrand:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
            console.log("🔌 Service: Đóng kết nối");
        }
    }
};

exports.deleteBrand = async (id) => {
    let connection;
    try {
        console.log("📍 Service: Bắt đầu xóa brand...");
        
        connection = await db.getConnection();
        console.log("✅ Service: Kết nối DB thành công");
        
        const sql = `DELETE FROM brand WHERE id = ?`;
        
        console.log("🔍 Service: Thực thi query:", sql);
        console.log("   Params:", [id]);
        
        const [result] = await connection.query(sql, [id]);
        
        console.log("✅ Service: Xóa brand thành công, affected rows:", result.affectedRows);
        return {
            success: true,
            message: "Xóa brand thành công"
        };
    } catch (error) {
        console.error("❌ Lỗi Service Brand - deleteBrand:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
            console.log("🔌 Service: Đóng kết nối");
        }
    }
};