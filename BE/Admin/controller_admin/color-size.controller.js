const { sequelize } = require('../../config/database');

// ========== COLOR MANAGEMENT ==========

// Lấy tất cả màu sắc
exports.getColors = async (req, res) => {
    try {
        const data = await sequelize.query("SELECT id, name, hex_code, created_at, updated_at FROM color ORDER BY id ASC", {
            type: sequelize.QueryTypes.SELECT
        });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách màu sắc: " + error.message });
    }
};

// Thêm màu sắc mới
exports.addColor = async (req, res) => {
    try {
        const { name, hex_code } = req.body;

        if (!name || !hex_code) {
            return res.status(400).json({ message: "Vui lòng cung cấp tên và mã màu" });
        }

        // Check duplicate name
        const exists = await sequelize.query("SELECT id FROM color WHERE name = ?", {
            replacements: [name],
            type: sequelize.QueryTypes.SELECT
        });

        if (exists.length > 0) {
            return res.status(400).json({ message: "Tên màu sắc đã tồn tại" });
        }

        // Insert new color
        const result = await sequelize.query(
            "INSERT INTO color (name, hex_code, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
            {
                replacements: [name, hex_code],
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({ 
            success: true, 
            message: "Thêm màu sắc thành công!",
            id: result[0]
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm màu sắc: " + error.message });
    }
};

// Cập nhật màu sắc
exports.updateColor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, hex_code } = req.body;

        if (!name || !hex_code) {
            return res.status(400).json({ message: "Vui lòng cung cấp tên và mã màu" });
        }

        // Check if color exists
        const color = await sequelize.query("SELECT id FROM color WHERE id = ?", {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT
        });

        if (color.length === 0) {
            return res.status(404).json({ message: "Màu sắc không tồn tại" });
        }

        // Check duplicate name (excluding current color)
        const duplicate = await sequelize.query("SELECT id FROM color WHERE name = ? AND id != ?", {
            replacements: [name, id],
            type: sequelize.QueryTypes.SELECT
        });

        if (duplicate.length > 0) {
            return res.status(400).json({ message: "Tên màu sắc đã tồn tại" });
        }

        // Update color
        await sequelize.query(
            "UPDATE color SET name = ?, hex_code = ?, updated_at = NOW() WHERE id = ?",
            {
                replacements: [name, hex_code, id],
                type: sequelize.QueryTypes.UPDATE
            }
        );

        res.status(200).json({ success: true, message: "Cập nhật màu sắc thành công!" });

    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật màu sắc: " + error.message });
    }
};

// Xóa màu sắc
exports.deleteColor = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if color exists
        const color = await sequelize.query("SELECT id FROM color WHERE id = ?", {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT
        });

        if (color.length === 0) {
            return res.status(404).json({ message: "Màu sắc không tồn tại" });
        }

        // Delete color
        await sequelize.query("DELETE FROM color WHERE id = ?", {
            replacements: [id],
            type: sequelize.QueryTypes.DELETE
        });

        res.status(200).json({ success: true, message: "Xóa màu sắc thành công!" });

    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa màu sắc: " + error.message });
    }
};


// ========== SIZE MANAGEMENT ==========

// Lấy tất cả kích thước
exports.getSizes = async (req, res) => {
    try {
        const data = await sequelize.query("SELECT id, size, created_at, updated_at FROM size ORDER BY size ASC", {
            type: sequelize.QueryTypes.SELECT
        });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách kích thước: " + error.message });
    }
};

// Thêm kích thước mới
exports.addSize = async (req, res) => {
    try {
        const { size } = req.body;

        if (!size) {
            return res.status(400).json({ message: "Vui lòng cung cấp kích thước" });
        }

        // Validate size is number
        const sizeNum = parseInt(size);
        if (isNaN(sizeNum) || sizeNum < 1 || sizeNum > 60) {
            return res.status(400).json({ message: "Kích thước phải là số từ 1 đến 60" });
        }

        // Check duplicate
        const exists = await sequelize.query("SELECT id FROM size WHERE size = ?", {
            replacements: [sizeNum],
            type: sequelize.QueryTypes.SELECT
        });

        if (exists.length > 0) {
            return res.status(400).json({ message: "Kích thước này đã tồn tại" });
        }

        // Insert new size
        const result = await sequelize.query(
            "INSERT INTO size (size, created_at, updated_at) VALUES (?, NOW(), NOW())",
            {
                replacements: [sizeNum],
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({ 
            success: true, 
            message: "Thêm kích thước thành công!",
            id: result[0]
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm kích thước: " + error.message });
    }
};

// Cập nhật kích thước
exports.updateSize = async (req, res) => {
    try {
        const { id } = req.params;
        const { size } = req.body;

        if (!size) {
            return res.status(400).json({ message: "Vui lòng cung cấp kích thước" });
        }

        // Validate size
        const sizeNum = parseInt(size);
        if (isNaN(sizeNum) || sizeNum < 1 || sizeNum > 60) {
            return res.status(400).json({ message: "Kích thước phải là số từ 1 đến 60" });
        }

        // Check if size exists
        const sizeRecord = await sequelize.query("SELECT id FROM size WHERE id = ?", {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT
        });

        if (sizeRecord.length === 0) {
            return res.status(404).json({ message: "Kích thước không tồn tại" });
        }

        // Check duplicate (excluding current size)
        const duplicate = await sequelize.query("SELECT id FROM size WHERE size = ? AND id != ?", {
            replacements: [sizeNum, id],
            type: sequelize.QueryTypes.SELECT
        });

        if (duplicate.length > 0) {
            return res.status(400).json({ message: "Kích thước này đã tồn tại" });
        }

        // Update size
        await sequelize.query(
            "UPDATE size SET size = ?, updated_at = NOW() WHERE id = ?",
            {
                replacements: [sizeNum, id],
                type: sequelize.QueryTypes.UPDATE
            }
        );

        res.status(200).json({ success: true, message: "Cập nhật kích thước thành công!" });

    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật kích thước: " + error.message });
    }
};

// Xóa kích thước
exports.deleteSize = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if size exists
        const size = await sequelize.query("SELECT id FROM size WHERE id = ?", {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT
        });

        if (size.length === 0) {
            return res.status(404).json({ message: "Kích thước không tồn tại" });
        }

        // Delete size
        await sequelize.query("DELETE FROM size WHERE id = ?", {
            replacements: [id],
            type: sequelize.QueryTypes.DELETE
        });

        res.status(200).json({ success: true, message: "Xóa kích thước thành công!" });

    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa kích thước: " + error.message });
    }
};
