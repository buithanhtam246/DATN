const db = require("../config/db");

// Lấy tất cả giới tính
exports.getAllGenders = async () => {
    let connection;
    try {
        console.log("📍 Service: Lấy tất cả giới tính...");
        connection = await db.getConnection();
        
        const sql = `SELECT id, name, code, icon, description, status FROM genders ORDER BY id`;
        const [rows] = await connection.query(sql);
        
        return rows.map(gender => ({
            id: gender.id,
            name: gender.name,
            code: gender.code,
            icon: gender.icon,
            description: gender.description,
            status: gender.status === 1 ? 'active' : 'inactive'
        }));
    } catch (error) {
        console.error("❌ Lỗi Service Genders - getAllGenders:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

// Lấy giới tính theo ID
exports.getGenderById = async (id) => {
    let connection;
    try {
        console.log("📍 Service: Lấy giới tính ID:", id);
        connection = await db.getConnection();
        
        const sql = `SELECT id, name, code, icon, description, status FROM genders WHERE id = ?`;
        const [rows] = await connection.query(sql, [id]);
        
        if (rows.length === 0) return null;
        
        const gender = rows[0];
        return {
            id: gender.id,
            name: gender.name,
            code: gender.code,
            icon: gender.icon,
            description: gender.description,
            status: gender.status === 1 ? 'active' : 'inactive'
        };
    } catch (error) {
        console.error("❌ Lỗi Service Genders - getGenderById:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

// Thêm giới tính mới
exports.createGender = async (name, code, icon, description, status) => {
    let connection;
    try {
        console.log("📍 Service: Thêm giới tính mới...", { name, code });
        connection = await db.getConnection();
        
        // Check duplicate code
        const checkSql = `SELECT id FROM genders WHERE code = ?`;
        const [exists] = await connection.query(checkSql, [code]);
        if (exists.length > 0) {
            throw new Error(`Code '${code}' đã tồn tại`);
        }
        
        const statusValue = status === 'active' ? 1 : 0;
        const sql = `INSERT INTO genders (name, code, icon, description, status) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await connection.query(sql, [name, code, icon || '', description || '', statusValue]);
        
        return {
            id: result.insertId,
            name,
            code,
            icon: icon || '',
            description: description || '',
            status: status || 'active'
        };
    } catch (error) {
        console.error("❌ Lỗi Service Genders - createGender:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

// Cập nhật giới tính
exports.updateGender = async (id, name, code, icon, description, status) => {
    let connection;
    try {
        console.log("📍 Service: Cập nhật giới tính ID:", id);
        connection = await db.getConnection();
        
        // Check if exists
        const checkSql = `SELECT id FROM genders WHERE id = ?`;
        const [exists] = await connection.query(checkSql, [id]);
        if (exists.length === 0) {
            throw new Error(`Giới tính ID ${id} không tồn tại`);
        }
        
        const statusValue = status === 'active' ? 1 : 0;
        const sql = `UPDATE genders SET name = ?, code = ?, icon = ?, description = ?, status = ? WHERE id = ?`;
        await connection.query(sql, [name, code, icon || '', description || '', statusValue, id]);
        
        return {
            id,
            name,
            code,
            icon: icon || '',
            description: description || '',
            status: status || 'active'
        };
    } catch (error) {
        console.error("❌ Lỗi Service Genders - updateGender:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

// Xóa giới tính
exports.deleteGender = async (id) => {
    let connection;
    try {
        console.log("📍 Service: Xóa giới tính ID:", id);
        connection = await db.getConnection();
        
        // Check if exists
        const checkSql = `SELECT id FROM genders WHERE id = ?`;
        const [exists] = await connection.query(checkSql, [id]);
        if (exists.length === 0) {
            throw new Error(`Giới tính ID ${id} không tồn tại`);
        }
        
        // Delete
        const sql = `DELETE FROM genders WHERE id = ?`;
        await connection.query(sql, [id]);
        
        return { id, message: 'Xóa giới tính thành công' };
    } catch (error) {
        console.error("❌ Lỗi Service Genders - deleteGender:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};
