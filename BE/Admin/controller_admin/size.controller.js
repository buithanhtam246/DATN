const { sequelize } = require('../../config/database');
const path = require('path');
const fs = require('fs');

// ========== SIZE MANAGEMENT ==========

// Lấy tất cả kích thước
exports.getSizes = async (req, res) => {
    try {
        const query = "SELECT id, size, category_id, created_at, updated_at FROM size ORDER BY category_id, size ASC";
        
        const data = await sequelize.query(query, {
            replacements: [],
            type: sequelize.QueryTypes.SELECT
        });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách kích thước: " + error.message });
    }
};

// Lấy sizes theo category
exports.getSizesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        if (!categoryId) {
            return res.status(400).json({ message: "Vui lòng cung cấp categoryId" });
        }
        
        const data = await sequelize.query(
            "SELECT id, size, category_id, created_at, updated_at FROM size WHERE category_id = ? ORDER BY size ASC",
            {
                replacements: [categoryId],
                type: sequelize.QueryTypes.SELECT
            }
        );
        
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy sizes của danh mục: " + error.message });
    }
};

// Lấy size guide (ảnh hướng dẫn) theo gender - DEPRECATED, use getSizeGuideByCategory instead
exports.getSizeGuideByGender = async (req, res) => {
    try {
        // This endpoint is deprecated. Use getSizeGuideByCategory instead
        return res.status(200).json({ message: "Không có guide theo gender. Hãy sử dụng category guide.", image_url: null });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy hướng dẫn size: " + error.message });
    }
};

// Thêm kích thước mới
exports.addSize = async (req, res) => {
    try {
        const { size, category_id } = req.body;

        if (!size || !category_id) {
            return res.status(400).json({ message: "Vui lòng cung cấp kích thước và danh mục" });
        }

        // Validate size is number
        const sizeNum = parseInt(size);
        if (isNaN(sizeNum) || sizeNum < 1 || sizeNum > 60) {
            return res.status(400).json({ message: "Kích thước phải là số từ 1 đến 60" });
        }

        // Check if category exists (should be parent category)
        const categoryExists = await sequelize.query(
            "SELECT id FROM categories WHERE id = ? AND parent_id IS NULL",
            {
                replacements: [category_id],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (categoryExists.length === 0) {
            return res.status(404).json({ message: "Danh mục cha không tồn tại" });
        }

        // Check duplicate (size + category)
        const exists = await sequelize.query(
            "SELECT id FROM size WHERE size = ? AND category_id = ?",
            {
                replacements: [sizeNum, category_id],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (exists.length > 0) {
            return res.status(400).json({ message: "Kích thước này đã tồn tại cho danh mục được chọn" });
        }

        // Insert new size
        const result = await sequelize.query(
            "INSERT INTO size (size, category_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
            {
                replacements: [sizeNum, category_id],
                type: sequelize.QueryTypes.INSERT
            }
        );

        const newId = result[0];
        const newSize = await sequelize.query("SELECT id, size, category_id, created_at, updated_at FROM size WHERE id = ?", {
            replacements: [newId],
            type: sequelize.QueryTypes.SELECT
        });

        res.status(201).json({ message: "Thêm kích thước thành công", data: newSize[0] });
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

        // Validate size is number
        const sizeNum = parseInt(size);
        if (isNaN(sizeNum) || sizeNum < 1 || sizeNum > 60) {
            return res.status(400).json({ message: "Kích thước phải là số từ 1 đến 60" });
        }

        // Check if size exists
        const sizeExists = await sequelize.query("SELECT id, category_id FROM size WHERE id = ?", {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT
        });

        if (sizeExists.length === 0) {
            return res.status(404).json({ message: "Kích thước không tồn tại" });
        }

        const category_id = sizeExists[0].category_id;

        // Check duplicate (excluding current size)
        const duplicate = await sequelize.query(
            "SELECT id FROM size WHERE size = ? AND category_id = ? AND id != ?",
            {
                replacements: [sizeNum, category_id, id],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (duplicate.length > 0) {
            return res.status(400).json({ message: "Kích thước này đã tồn tại cho danh mục được chọn" });
        }

        // Update size
        await sequelize.query(
            "UPDATE size SET size = ?, updated_at = NOW() WHERE id = ?",
            {
                replacements: [sizeNum, id],
                type: sequelize.QueryTypes.UPDATE
            }
        );

        const updated = await sequelize.query(
            "SELECT id, size, category_id, created_at, updated_at FROM size WHERE id = ?",
            {
                replacements: [id],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.status(200).json({ message: "Cập nhật kích thước thành công", data: updated[0] });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật kích thước: " + error.message });
    }
};

// Cập nhật ảnh hướng dẫn size theo giới tính
exports.uploadSizeGuide = async (req, res) => {
    try {
        const { gender } = req.params;

        if (!gender || !['male', 'female', 'unisex'].includes(gender)) {
            return res.status(400).json({ message: "Giới tính phải là 'male', 'female', hoặc 'unisex'" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng chọn hình ảnh" });
        }

        const imageUrl = req.file.filename;

        // Check if guide image already exists for this gender
        const existing = await sequelize.query(
            "SELECT id FROM size WHERE gender = ? AND COALESCE(size_image_url, image_url) IS NOT NULL LIMIT 1",
            {
                replacements: [gender],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (existing.length > 0) {
            // Delete old image
            const oldImage = existing[0];
            const query = "SELECT COALESCE(size_image_url, image_url) as image_url FROM size WHERE id = ?";
            const [oldImageData] = await sequelize.query(query, {
                replacements: [oldImage.id],
                type: sequelize.QueryTypes.SELECT
            });

            if (oldImageData && oldImageData.image_url) {
                const oldImagePath = path.join(__dirname, '../public/images/size-guides', oldImageData.image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Update with new image
            await sequelize.query(
                "UPDATE size SET size_image_url = ?, updated_at = NOW() WHERE id = ?",
                {
                    replacements: [imageUrl, oldImage.id],
                    type: sequelize.QueryTypes.UPDATE
                }
            );
        } else {
            // If no guide exists, create one by updating first size of this gender
            const firstSize = await sequelize.query(
                "SELECT id FROM size WHERE gender = ? ORDER BY size ASC LIMIT 1",
                {
                    replacements: [gender],
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (firstSize.length === 0) {
                return res.status(404).json({ message: "Không có kích thước nào cho giới tính này" });
            }

            await sequelize.query(
                "UPDATE size SET size_image_url = ?, updated_at = NOW() WHERE id = ?",
                {
                    replacements: [imageUrl, firstSize[0].id],
                    type: sequelize.QueryTypes.UPDATE
                }
            );
        }

        res.status(200).json({ 
            message: "Cập nhật hình ảnh hướng dẫn size thành công",
            data: { gender, imageUrl }
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật hình ảnh hướng dẫn: " + error.message });
    }
};

// Lấy hình ảnh hướng dẫn size cho tất cả giới tính
exports.getAllSizeGuides = async (req, res) => {
    try {
        const guides = await sequelize.query(
            "SELECT DISTINCT gender, COALESCE(size_image_url, image_url) as image_url FROM size WHERE COALESCE(size_image_url, image_url) IS NOT NULL",
            {
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.status(200).json(guides);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy hình ảnh hướng dẫn: " + error.message });
    }
};

// Xóa hình ảnh hướng dẫn size theo giới tính
exports.deleteSizeGuide = async (req, res) => {
    try {
        const { gender } = req.params;

        if (!gender || !['male', 'female', 'unisex'].includes(gender)) {
            return res.status(400).json({ message: "Giới tính phải là 'male', 'female', hoặc 'unisex'" });
        }

        // Find the size record with image_url for this gender
        const guide = await sequelize.query(
            "SELECT id, COALESCE(size_image_url, image_url) as image_url FROM size WHERE gender = ? AND COALESCE(size_image_url, image_url) IS NOT NULL LIMIT 1",
            {
                replacements: [gender],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (guide.length === 0) {
            return res.status(404).json({ message: "Không có hình ảnh hướng dẫn cho giới tính này" });
        }

        // Delete image file from disk
        if (guide[0].image_url) {
            const imagePath = path.join(__dirname, '../public/images/size-guides', guide[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Clear image_url from database
        await sequelize.query(
            "UPDATE size SET size_image_url = NULL, updated_at = NOW() WHERE id = ?",
            {
                replacements: [guide[0].id],
                type: sequelize.QueryTypes.UPDATE
            }
        );

        res.status(200).json({ 
            message: "Xóa hình ảnh hướng dẫn size thành công",
            data: { gender, deleted: true }
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa hình ảnh hướng dẫn: " + error.message });
    }
};

// Xóa kích thước
exports.deleteSize = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if size exists
        const size = await sequelize.query("SELECT id, COALESCE(size_image_url, image_url) as image_url FROM size WHERE id = ?", {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT
        });

        if (size.length === 0) {
            return res.status(404).json({ message: "Kích thước không tồn tại" });
        }

        // Delete associated image if exists
        if (size[0].image_url) {
            const imagePath = path.join(__dirname, '../public/images/size-guides', size[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Delete size
        await sequelize.query("DELETE FROM size WHERE id = ?", {
            replacements: [id],
            type: sequelize.QueryTypes.DELETE
        });

        res.status(200).json({ message: "Xóa kích thước thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa kích thước: " + error.message });
    }
};

// ========== CATEGORY SIZE GUIDE MANAGEMENT ==========

// Lấy ảnh hướng dẫn size theo category
exports.getSizeGuideByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const result = await sequelize.query(
            "SELECT id, size_guide_image_url FROM categories WHERE id = ?",
            {
                replacements: [categoryId],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (result.length > 0) {
            res.status(200).json({ 
                category_id: categoryId, 
                image_url: result[0].size_guide_image_url 
            });
        } else {
            res.status(200).json({ category_id: categoryId, image_url: null });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy ảnh hướng dẫn category: " + error.message });
    }
};

// Upload ảnh hướng dẫn size cho category
exports.uploadSizeGuideByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!categoryId) {
            return res.status(400).json({ message: "Vui lòng cung cấp category_id" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng chọn hình ảnh" });
        }

        const imageUrl = req.file.filename;

        // Check if category exists
        const category = await sequelize.query(
            "SELECT id, size_guide_image_url FROM categories WHERE id = ?",
            {
                replacements: [categoryId],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (category.length === 0) {
            return res.status(404).json({ message: "Category không tồn tại" });
        }

        // Delete old image if exists
        if (category[0].size_guide_image_url) {
            const oldImagePath = path.join(__dirname, '../../uploads/size-guides', category[0].size_guide_image_url);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Update category with new image
        await sequelize.query(
            "UPDATE categories SET size_guide_image_url = ? WHERE id = ?",
            {
                replacements: [imageUrl, categoryId],
                type: sequelize.QueryTypes.UPDATE
            }
        );

        res.status(200).json({ message: "Upload ảnh hướng dẫn thành công", image_url: imageUrl });
    } catch (error) {
        res.status(500).json({ message: "Lỗi upload ảnh hướng dẫn: " + error.message });
    }
};

// Xóa ảnh hướng dẫn size của category
exports.deleteSizeGuideByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await sequelize.query(
            "SELECT id, size_guide_image_url FROM categories WHERE id = ?",
            {
                replacements: [categoryId],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (category.length === 0 || !category[0].size_guide_image_url) {
            return res.status(404).json({ message: "Ảnh hướng dẫn không tồn tại" });
        }

        // Delete image file
        const imagePath = path.join(__dirname, '../../uploads/size-guides', category[0].size_guide_image_url);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Update category to remove image reference
        await sequelize.query(
            "UPDATE categories SET size_guide_image_url = NULL WHERE id = ?",
            {
                replacements: [categoryId],
                type: sequelize.QueryTypes.UPDATE
            }
        );

        res.status(200).json({ message: "Xóa ảnh hướng dẫn thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa ảnh hướng dẫn: " + error.message });
    }
};
