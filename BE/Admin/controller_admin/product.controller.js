const { sequelize } = require('../../config/database');

// --- 1. LẤY DANH SÁCH CATEGORY (Để hiện lên ô chọn ở FE) ---
exports.getCategoryList = async (req, res) => {
    try {
        // Truy vấn trực tiếp từ bảng categories (có s)
        const data = await sequelize.query("SELECT id, name FROM categories WHERE status = 1", {
            type: sequelize.QueryTypes.SELECT
        });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh mục: " + error.message });
    }
};

// --- 2. LẤY DANH SÁCH BRAND (Để hiện lên ô chọn ở FE) ---
exports.getBrandList = async (req, res) => {
    try {
        // Truy vấn trực tiếp từ bảng brand (không s)
        const data = await sequelize.query("SELECT id, name FROM brand", {
            type: sequelize.QueryTypes.SELECT
        });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy thương hiệu: " + error.message });
    }
};

// --- 3. HÀM LẤY TẤT CẢ SẢN PHẨM (Đã sửa từ ID thành Name) ---
exports.getAllProducts = async (req, res) => {
    try {
        const models = sequelize.models;
        const ProductModel = models.products || models.Product;
        const VariantModel = models.variant || models.Variant || models.product_variants;

        if (!ProductModel) return res.status(500).json({ message: "Model chưa load" });

        const data = await ProductModel.findAll({
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT name FROM categories AS cat
                            WHERE cat.id = products.category_id
                            LIMIT 1
                        )`),
                        'category_name'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT name FROM brand AS br
                            WHERE br.id = products.brand_id
                            LIMIT 1
                        )`),
                        'brand_name'
                    ]
                ]
            },
            include: [
                {
                    model: VariantModel,
                    as: 'variants',
                    attributes: ['id', 'color_id', 'size_id', 'price', 'price_sale', 'quantity', 'image']
                }
            ],
            order: [['id', 'DESC']]
        });

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi truy vấn: " + error.message });
    }
};

// --- 4. HÀM THÊM MỚI SẢN PHẨM KÈM BIẾN THỂ ---
exports.createFullProduct = async (req, res) => {
    let t; 
    try {
        const models = sequelize.models;
        const ProductModel = models.products || models.Product;
        const VariantModel = models.variant || models.Variant || models.product_variants;

        const { name, category_id, brand_id, describ, variants } = req.body;
        const files = req.files || []; 

        t = await sequelize.transaction();

        // Lưu sản phẩm chính
        const mainImage = files.length > 0 ? files[0].filename : 'default.jpg';
        const newProduct = await ProductModel.create({
            name,
            category_id, 
            brand_id,
            describ,
            image: mainImage,
            date_add: new Date()
        }, { transaction: t });

        // Lưu các biến thể
        if (variants) {
            const variantsData = typeof variants === 'string' ? JSON.parse(variants) : variants;
            if (Array.isArray(variantsData)) {
                const finalVariants = variantsData.map((v, index) => ({
                    ...v,
                    product_id: newProduct.id,
                    // Nếu gửi nhiều ảnh, file[0] cho sp chính, file[1] cho biến thể 1...
                    image: files[index + 1] ? files[index + 1].filename : mainImage 
                }));
                await VariantModel.bulkCreate(finalVariants, { transaction: t });
            }
        }

        await t.commit();
        res.status(201).json({ success: true, message: "Thêm thành công!", data: newProduct });

    } catch (error) {
        if (t) await t.rollback(); 
        res.status(500).json({ message: "Lỗi thêm sản phẩm: " + error.message });
    }
};

// --- 5. CẬP NHẬT SẢN PHẨM KÈM BIẾN THỂ ---
exports.updateProduct = async (req, res) => {
    let t;
    try {
        const { id } = req.params;
        const models = sequelize.models;
        const ProductModel = models.products || models.Product;
        const VariantModel = models.variant || models.Variant || models.product_variants;

        const { name, category_id, brand_id, describ, variants } = req.body;
        const files = req.files || [];

        // Kiểm tra sản phẩm có tồn tại không
        const product = await ProductModel.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        t = await sequelize.transaction();

        // Cập nhật thông tin sản phẩm
        const updateData = {
            name,
            category_id,
            brand_id,
            describ
        };

        // Nếu có file ảnh mới, cập nhật hình ảnh chính
        if (files.length > 0) {
            updateData.image = files[0].filename;
        }

        await product.update(updateData, { transaction: t });

        // Cập nhật biến thể
        if (variants) {
            const variantsData = typeof variants === 'string' ? JSON.parse(variants) : variants;
            
            if (Array.isArray(variantsData)) {
                // Xóa các biến thể cũ
                await VariantModel.destroy({ where: { product_id: id }, transaction: t });

                // Thêm biến thể mới
                const finalVariants = variantsData.map((v, index) => ({
                    ...v,
                    product_id: id,
                    image: files[index + 1] ? files[index + 1].filename : (v.image || product.image)
                }));
                await VariantModel.bulkCreate(finalVariants, { transaction: t });
            }
        }

        await t.commit();
        res.status(200).json({ success: true, message: "Cập nhật thành công!", data: product });

    } catch (error) {
        if (t) await t.rollback();
        res.status(500).json({ message: "Lỗi cập nhật sản phẩm: " + error.message });
    }
};

// --- 6. XÓA SẢN PHẨM KÈM BIẾN THỂ ---
exports.deleteProduct = async (req, res) => {
    let t;
    try {
        const { id } = req.params;
        const models = sequelize.models;
        const ProductModel = models.products || models.Product;
        const VariantModel = models.variant || models.Variant || models.product_variants;

        // Kiểm tra sản phẩm có tồn tại không
        const product = await ProductModel.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        t = await sequelize.transaction();

        // Xóa biến thể trước
        await VariantModel.destroy({ where: { product_id: id }, transaction: t });

        // Xóa sản phẩm
        await product.destroy({ transaction: t });

        await t.commit();
        res.status(200).json({ success: true, message: "Xóa thành công!" });

    } catch (error) {
        if (t) await t.rollback();
        res.status(500).json({ message: "Lỗi xóa sản phẩm: " + error.message });
    }
};