const genderService = require("../service/gender.service");

// Lấy tất cả giới tính
exports.getAllGenders = async (req, res) => {
    try {
        const genders = await genderService.getAllGenders();
        res.json({ success: true, data: genders });
    } catch (error) {
        console.error("❌ Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy giới tính theo ID
exports.getGenderById = async (req, res) => {
    try {
        const { id } = req.params;
        const gender = await genderService.getGenderById(id);

        if (!gender) {
            return res.status(404).json({ success: false, message: "Giới tính không tồn tại" });
        }

        res.json({ success: true, data: gender });
    } catch (error) {
        console.error("❌ Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Thêm giới tính mới
exports.createGender = async (req, res) => {
    try {
        const { name, code, icon, description, status } = req.body;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Tên và code giới tính không được để trống"
            });
        }

        const gender = await genderService.createGender(
            name.trim(),
            code.trim(),
            icon || '',
            description || '',
            status || 'active'
        );

        res.status(201).json({
            success: true,
            message: "Thêm giới tính thành công",
            data: gender
        });
    } catch (error) {
        console.error("❌ Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật giới tính
exports.updateGender = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, icon, description, status } = req.body;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Tên và code giới tính không được để trống"
            });
        }

        const gender = await genderService.updateGender(
            id,
            name.trim(),
            code.trim(),
            icon || '',
            description || '',
            status || 'active'
        );

        res.json({
            success: true,
            message: "Cập nhật giới tính thành công",
            data: gender
        });
    } catch (error) {
        console.error("❌ Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa giới tính
exports.deleteGender = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await genderService.deleteGender(id);

        res.json({
            success: true,
            message: "Xóa giới tính thành công",
            data: result
        });
    } catch (error) {
        console.error("❌ Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
