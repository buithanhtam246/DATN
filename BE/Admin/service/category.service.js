const db = require("../config/db");

// Lấy danh mục cấp 1 (Nam/Nữ/Trẻ em/Unisex)
exports.getParentCategories = async () => {
    let connection;
    try {
        console.log("📍 Service: Lấy danh mục cấp 1...");
        connection = await db.getConnection();
        
        const sql = `SELECT id, name, status FROM categories WHERE parent_id IS NULL ORDER BY id`;
        const [rows] = await connection.query(sql);
        
        return rows.map(cat => ({
            id: cat.id,
            name: cat.name,
            status: cat.status === 1 ? 'active' : 'inactive',
            children: []
        }));
    } catch (error) {
        console.error("❌ Lỗi Service Categories - getParentCategories:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

// Lấy danh mục con theo parent_id
exports.getSubCategories = async (parentId) => {
    let connection;
    try {
        console.log("📍 Service: Lấy danh mục con của parent:", parentId);
        connection = await db.getConnection();
        
        const sql = `SELECT id, parent_id, name, status FROM categories WHERE parent_id = ? ORDER BY id`;
        const [rows] = await connection.query(sql, [parentId]);
        
        return rows.map(cat => ({
            id: cat.id,
            parent_id: cat.parent_id,
            name: cat.name,
            status: cat.status === 1 ? 'active' : 'inactive'
        }));
    } catch (error) {
        console.error("❌ Lỗi Service Categories - getSubCategories:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

// Lấy tất cả danh mục (cấp 1 + cấp 2)
exports.getAllCategories = async () => {
    let connection;
    try {
        console.log("📍 Service: Lấy tất cả danh mục...");
        connection = await db.getConnection();
        
        // Lấy danh mục cấp 1
        const parentSql = `SELECT id, name, status FROM categories WHERE parent_id IS NULL ORDER BY id`;
        const [parents] = await connection.query(parentSql);
        
        // Lấy tất cả danh mục cấp 2
        const childSql = `SELECT id, parent_id, name, status FROM categories WHERE parent_id IS NOT NULL ORDER BY parent_id, id`;
        const [children] = await connection.query(childSql);
        
        // Kết hợp parent + children
        const result = parents.map(parent => {
            const parentCategory = {
                id: parent.id,
                name: parent.name,
                status: parent.status === 1 ? 'active' : 'inactive',
                isParent: true,
                children: children
                    .filter(child => child.parent_id === parent.id)
                    .map(child => ({
                        id: child.id,
                        parent_id: child.parent_id,
                        name: child.name,
                        status: child.status === 1 ? 'active' : 'inactive',
                        isParent: false
                    }))
            };
            return parentCategory;
        });
        
        return result;
    } catch (error) {
        console.error("❌ Lỗi Service Categories - getAllCategories:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

// Tạo danh mục cấp 1 (Nam/Nữ/Trẻ em/Unisex)
exports.createParentCategory = async (name, status) => {
    let connection;
    try {
        console.log("📍 Service: Thêm danh mục cấp 1...");
        connection = await db.getConnection();
        
        const statusValue = status === 'active' ? 1 : 0;
        const sql = `INSERT INTO categories (parent_id, name, status) VALUES (NULL, ?, ?)`;
        const [result] = await connection.query(sql, [name, statusValue]);
        
        return {
            id: result.insertId,
            name: name,
            status: status,
            isParent: true,
            children: []
        };
    } catch (error) {
        console.error("❌ Lỗi Service Categories - createParentCategory:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

// Tạo danh mục cấp 2 (con)
exports.createSubCategory = async (parentId, name, status) => {
    let connection;
    try {
        console.log("📍 Service: Thêm danh mục cấp 2...");
        connection = await db.getConnection();
        
        const statusValue = status === 'active' ? 1 : 0;
        const sql = `INSERT INTO categories (parent_id, name, status) VALUES (?, ?, ?)`;
        const [result] = await connection.query(sql, [parentId, name, statusValue]);
        
        return {
            id: result.insertId,
            parent_id: parentId,
            name: name,
            status: status,
            isParent: false
        };
    } catch (error) {
        console.error("❌ Lỗi Service Categories - createSubCategory:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

// Cập nhật danh mục
exports.updateCategory = async (id, name, status) => {
    let connection;
    try {
        console.log("📍 Service: Cập nhật danh mục ID:", id);
        connection = await db.getConnection();
        
        const statusValue = status === 'active' ? 1 : 0;
        const sql = `UPDATE categories SET name = ?, status = ? WHERE id = ?`;
        const [result] = await connection.query(sql, [name, statusValue, id]);
        
        return {
            id: id,
            name: name,
            status: status
        };
    } catch (error) {
        console.error("❌ Lỗi Service Categories - updateCategory:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

// Xóa danh mục (xóa cả con nếu là parent)
exports.deleteCategory = async (id) => {
    let connection;
    try {
        console.log("📍 Service: Xóa danh mục ID:", id);
        connection = await db.getConnection();
        
        // Nếu là danh mục cấp 1, xóa cả danh mục con (CASCADE)
        const sql = `DELETE FROM categories WHERE id = ? OR parent_id = ?`;
        const [result] = await connection.query(sql, [id, id]);
        
        return {
            success: true,
            message: "Xóa danh mục thành công",
            affectedRows: result.affectedRows
        };
    } catch (error) {
        console.error("❌ Lỗi Service Categories - deleteCategory:", error.message);
        throw error;
    } finally {
        if (connection) await connection.release();
    }
};

// Legacy methods (giữ lại để không break code cũ)
exports.getCategoryById = async (id) => {
    let connection;
    try {
        connection = await db.getConnection();
        const sql = `SELECT id, name, status FROM categories WHERE id = ?`;
        const [rows] = await connection.query(sql, [id]);
        return rows[0] || null;
    } finally {
        if (connection) await connection.release();
    }
};

exports.deleteCategory = async (id) => {
    const sql = `DELETE FROM categories WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
};