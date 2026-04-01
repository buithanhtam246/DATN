const categoryService = require("../service/category.service");

// Lấy danh mục cấp 1 (Nam/Nữ)
exports.getParentCategories = async (req, res) => {
    try {
        const categories = await categoryService.getParentCategories();
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error("❌ Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy danh mục con theo parent_id
exports.getSubCategories = async (req, res) => {
    try {
        const { parentId } = req.params;
        const categories = await categoryService.getSubCategories(parentId);
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error("❌ Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy tất cả danh mục (cấp 1 + cấp 2)
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error("❌ Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tạo danh mục cấp 1 (Nam/Nữ)
exports.createParentCategory = async (req, res) => {
    try {
        const { name, gender, status } = req.body;

        if (!name || !name.trim() || !gender) {
            return res.status(400).json({
                success: false,
                message: "Tên danh mục và giới tính không được để trống"
            });
        }

        const category = await categoryService.createParentCategory(
            name.trim(),
            gender,
            status || 'active'
        );

        // Return parent category with children array
        const categoryWithChildren = {
            ...category,
            isParent: true,
            children: []
        };

        res.status(201).json({
            success: true,
            message: "Thêm danh mục thành công",
            data: categoryWithChildren
        });
    } catch (error) {
        console.error("❌ Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tạo danh mục cấp 2 (con)
exports.createSubCategory = async (req, res) => {
    try {
        const { parentId, name, gender, status } = req.body;

        if (!parentId || !name || !name.trim() || !gender) {
            return res.status(400).json({
                success: false,
                message: "Parent ID, tên danh mục và giới tính không được để trống"
            });
        }

        const category = await categoryService.createSubCategory(
            parentId,
            name.trim(),
            gender,
            status || 'active'
        );

        // Return child category without children array
        const categoryWithoutChildren = {
            ...category,
            isParent: false
        };

        res.status(201).json({
            success: true,
            message: "Thêm danh mục con thành công",
            data: categoryWithoutChildren
        });
    } catch (error) {
        console.error("❌ Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật danh mục
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, gender, status } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tên danh mục không được để trống"
            });
        }

        const category = await categoryService.updateCategory(
            id,
            name.trim(),
            gender,
            status || 'active'
        );

        res.json({
            success: true,
            message: "Cập nhật danh mục thành công",
            data: category
        });
    } catch (error) {
        console.error("❌ Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa danh mục
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await categoryService.deleteCategory(id);

        res.json({
            success: true,
            message: "Xóa danh mục thành công",
            data: result
        });
    } catch (error) {
        console.error("❌ Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Legacy endpoints
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoryById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.json({ success: true, data: category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};