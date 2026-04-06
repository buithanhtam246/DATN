const brandService = require("../service/brand.service");

exports.getAllBrands = async (req, res) => {
    try {
        const brands = await brandService.getAllBrands();
        res.json({
            success: true,
            data: brands
        });
    } catch (error) {
        console.error("Lỗi Controller Brand:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

exports.createBrand = async (req, res) => {
    try {
        const { name, status } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: "Tên brand không được để trống" 
            });
        }
        
        const brand = await brandService.createBrand(name, status || 'active');
        res.status(201).json({
            success: true,
            message: "Thêm brand thành công",
            data: brand
        });
    } catch (error) {
        console.error("Lỗi Controller Brand - createBrand:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Lỗi máy chủ" 
        });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: "Tên brand không được để trống" 
            });
        }
        
        const brand = await brandService.updateBrand(id, name, status || 'active');
        res.json({
            success: true,
            message: "Cập nhật brand thành công",
            data: brand
        });
    } catch (error) {
        console.error("Lỗi Controller Brand - updateBrand:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Lỗi máy chủ" 
        });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await brandService.deleteBrand(id);
        res.json({
            success: true,
            message: "Xóa brand thành công",
            data: result
        });
    } catch (error) {
        console.error("Lỗi Controller Brand - deleteBrand:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Lỗi máy chủ" 
        });
    }
};