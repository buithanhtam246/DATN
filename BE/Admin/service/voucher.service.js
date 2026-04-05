const db = require("../config/db");

exports.getAllVouchers = async () => {
    let connection;
    try {
        console.log("📍 Service: Bắt đầu lấy danh sách voucher...");
        
        connection = await db.getConnection();
        console.log("✅ Service: Kết nối DB thành công");
        
        const sql = `SELECT id, code_voucher as code, name_voucher as name, promotion_type as discount_type, value_reduced as discount_value, quantity, max_value, minimum_order, start_date, promotion_date as endDate FROM vouchers ORDER BY id DESC`;
        console.log("🔍 Service: Thực thi query:", sql);
        
        const [rows] = await connection.query(sql);
        console.log("✅ Service: Lấy dữ liệu thành công, số lượng:", rows.length);

        const result = rows.map(voucher => ({
            id: voucher.id,
            code: voucher.code,
            name: voucher.name,
            discountType: voucher.discount_type,
            discountValue: voucher.discount_value,
            quantity: voucher.quantity,
            maxValue: voucher.max_value,
            minimumOrder: voucher.minimum_order || 0,
            startDate: voucher.start_date,
            endDate: voucher.endDate
        }));
        
        console.log("📤 Service: Trả về kết quả:", result);
        return result;
    } catch (error) {
        console.error("❌ Lỗi Service Voucher - getAllVouchers:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
            console.log("🔌 Service: Đóng kết nối");
        }
    }
};

exports.getVoucherById = async (id) => {
    let connection;
    try {
        connection = await db.getConnection();
        const sql = `SELECT * FROM vouchers WHERE id = ?`;
        const [rows] = await connection.query(sql, [id]);
        
        if (rows.length === 0) {
            return null;
        }
        
        return rows[0];
    } catch (error) {
        console.error("❌ Lỗi Service Voucher - getVoucherById:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};

exports.createVoucher = async (voucherData) => {
    let connection;
    try {
        connection = await db.getConnection();
        const { code_voucher, name_voucher, promotion_type, value_reduced, quantity, minimum_order, start_date, max_value, promotion_date } = voucherData;
        
        const sql = `INSERT INTO vouchers (code_voucher, name_voucher, promotion_type, value_reduced, quantity, minimum_order, start_date, max_value, promotion_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.query(sql, [code_voucher, name_voucher, promotion_type, value_reduced, quantity, minimum_order || 0, start_date, max_value || null, promotion_date]);
        
        return { id: result.insertId, ...voucherData };
    } catch (error) {
        console.error("❌ Lỗi Service Voucher - createVoucher:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};

exports.updateVoucher = async (id, voucherData) => {
    let connection;
    try {
        connection = await db.getConnection();
        const { code_voucher, name_voucher, promotion_type, value_reduced, quantity, minimum_order, start_date, max_value, promotion_date } = voucherData;
        
        const sql = `UPDATE vouchers SET code_voucher = ?, name_voucher = ?, promotion_type = ?, value_reduced = ?, quantity = ?, minimum_order = ?, start_date = ?, max_value = ?, promotion_date = ? WHERE id = ?`;
        const [result] = await connection.query(sql, [code_voucher, name_voucher, promotion_type, value_reduced, quantity, minimum_order || 0, start_date, max_value || null, promotion_date, id]);
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return { id, ...voucherData };
    } catch (error) {
        console.error("❌ Lỗi Service Voucher - updateVoucher:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};

exports.deleteVoucher = async (id) => {
    let connection;
    try {
        connection = await db.getConnection();
        const sql = `DELETE FROM vouchers WHERE id = ?`;
        const [result] = await connection.query(sql, [id]);
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error("❌ Lỗi Service Voucher - deleteVoucher:", error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};
