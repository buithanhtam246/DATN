const { sequelize } = require('../../config/database');

function expandVariantsPayload(variantsData, files, defaultImage, imageKeyPrefix = 'variant_group_image_') {
    if (!Array.isArray(variantsData)) return [];

    const expandedVariants = [];

    variantsData.forEach((variant, index) => {
        const variantImageFile = files.find(f => f.fieldname === `${imageKeyPrefix}${index}`)
            || files.find(f => f.fieldname === `variant_image_${index}`);
        const variantImage = variantImageFile
            ? variantImageFile.filename
            : (variant.image || defaultImage || 'default.jpg');

        const selectedSizes = Array.isArray(variant.selected_sizes)
            ? variant.selected_sizes.filter(sizeId => sizeId !== null && sizeId !== undefined && sizeId !== '')
            : [];

        if (selectedSizes.length > 0) {
            selectedSizes.forEach((sizeId) => {
                expandedVariants.push({
                    color_id: variant.color_id || null,
                    size_id: sizeId,
                    price: variant.price || 0,
                    price_sale: variant.price_sale || 0,
                    quantity: variant.quantity || 0,
                    image: variantImage
                });
            });
            return;
        }

        expandedVariants.push({
            color_id: variant.color_id || null,
            size_id: variant.size_id || null,
            price: variant.price || 0,
            price_sale: variant.price_sale || 0,
            quantity: variant.quantity || 0,
            image: variantImage
        });
    });

    return expandedVariants;
}

function parseProductsImagesColumn(rawValue) {
    if (!rawValue) {
        return { common: [], byColor: {} };
    }

    let parsedValue = rawValue;
    for (let index = 0; index < 2 && typeof parsedValue === 'string'; index += 1) {
        try {
            parsedValue = JSON.parse(parsedValue);
        } catch (_error) {
            break;
        }
    }

    if (Array.isArray(parsedValue)) {
        return {
            common: parsedValue.filter(Boolean),
            byColor: {}
        };
    }

    if (parsedValue && typeof parsedValue === 'object') {
        const common = Array.isArray(parsedValue.common)
            ? parsedValue.common.filter(Boolean)
            : [];

        const byColorRaw = parsedValue.byColor && typeof parsedValue.byColor === 'object'
            ? parsedValue.byColor
            : {};

        const byColor = Object.entries(byColorRaw).reduce((acc, [colorKey, imageList]) => {
            const normalizedList = Array.isArray(imageList)
                ? imageList.filter(Boolean)
                : [];

            if (normalizedList.length > 0) {
                acc[colorKey] = normalizedList;
            }

            return acc;
        }, {});

        return { common, byColor };
    }

    return { common: [], byColor: {} };
}

function collectByColorExtraImages(variantsData, files) {
    if (!Array.isArray(variantsData) || !Array.isArray(files)) {
        return {};
    }

    const byColorImages = {};

    variantsData.forEach((variant, variantIndex) => {
        const colorId = Number(variant?.color_id);
        if (!Number.isFinite(colorId) || colorId <= 0) {
            return;
        }

        const extraImages = files
            .filter((file) => file.fieldname.startsWith(`variant_group_extra_image_${variantIndex}_`))
            .sort((left, right) => {
                const leftIndex = Number(left.fieldname.split('_').pop());
                const rightIndex = Number(right.fieldname.split('_').pop());
                return leftIndex - rightIndex;
            })
            .map((file) => file.filename)
            .filter(Boolean);

        if (extraImages.length > 0) {
            byColorImages[String(colorId)] = extraImages;
        }
    });

    return byColorImages;
}

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

// --- 3.5. HÀM LẤY CHI TIẾT SẢN PHẨM THEO ID ---
exports.getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const models = sequelize.models;
        const ProductModel = models.products || models.Product;

        if (!ProductModel) return res.status(500).json({ message: "Model chưa load" });

        // Truy vấn chi tiết sản phẩm kèm biến thể (join với color và size)
        const product = await sequelize.query(`
            SELECT 
                p.id,
                p.name,
                p.brand_id,
                p.category_id,
                p.describ,
                p.image,
                p.images,
                p.status,
                p.date_add,
                p.price,
                (SELECT name FROM categories WHERE id = p.category_id LIMIT 1) as category_name,
                (SELECT name FROM brand WHERE id = p.brand_id LIMIT 1) as brand_name,
                v.id as variant_id,
                v.color_id,
                v.size_id,
                v.price as variant_price,
                v.price_sale,
                v.quantity,
                v.image as variant_image,
                c.name as color_name,
                c.hex_code as color_code,
                s.size as size_name
            FROM products p
            LEFT JOIN variant v ON p.id = v.product_id
            LEFT JOIN color c ON v.color_id = c.id
            LEFT JOIN size s ON v.size_id = s.id
            WHERE p.id = ?
            ORDER BY v.id DESC
        `, {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT
        });

        if (!product || product.length === 0) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        // Nhóm dữ liệu lại
        const productData = {
            id: product[0].id,
            name: product[0].name,
            brand_id: product[0].brand_id,
            category_id: product[0].category_id,
            describ: product[0].describ,
            image: product[0].image,
            images: product[0].images,
            status: product[0].status,
            date_add: product[0].date_add,
            price: product[0].price,
            category_name: product[0].category_name,
            brand_name: product[0].brand_name,
            variants: product
                .filter(p => p.variant_id)
                .map(p => ({
                    id: p.variant_id,
                    color_id: p.color_id,
                    size_id: p.size_id,
                    price: p.variant_price,
                    price_sale: p.price_sale,
                    quantity: p.quantity,
                    image: p.variant_image,
                    color_name: p.color_name,
                    color_code: p.color_code,
                    size_name: p.size_name
                }))
        };

        res.status(200).json(productData);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy chi tiết sản phẩm: " + error.message });
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
        const variantsData = variants
            ? (typeof variants === 'string' ? JSON.parse(variants) : variants)
            : [];

        console.log('📝 Create Product Request:');
        console.log('  - Name:', name);
        console.log('  - Category:', category_id);
        console.log('  - Brand:', brand_id);
        console.log('  - Files count:', files.length);
        console.log('  - Files:', files.map(f => ({ fieldname: f.fieldname, filename: f.filename })));

        t = await sequelize.transaction();

        // Lưu sản phẩm chính - lấy file 'images' field đầu tiên
        const mainImageFile = files.find(f => f.fieldname === 'images');
        const mainImage = mainImageFile ? mainImageFile.filename : 'default.jpg';
        
        // Ảnh phụ chung sản phẩm
        const imageFiles = files.filter(f => f.fieldname === 'images');
        const commonImages = imageFiles.slice(1).map(f => f.filename);

        // Ảnh phụ theo từng màu
        const byColorImages = collectByColorExtraImages(variantsData, files);
        const imagesPayload = (commonImages.length > 0 || Object.keys(byColorImages).length > 0)
            ? { common: commonImages, byColor: byColorImages }
            : null;
        
        console.log('✅ Main image:', mainImage);
        console.log('✅ Common images:', commonImages);
        console.log('✅ By-color images:', byColorImages);
        
        const newProduct = await ProductModel.create({
            name,
            category_id, 
            brand_id,
            describ,
            image: mainImage,
            images: imagesPayload,
            date_add: new Date()
        }, { transaction: t });

        console.log('✅ Product created with ID:', newProduct.id);
        console.log('✅ Product images column:', newProduct.images);

        // Lưu các biến thể
        if (Array.isArray(variantsData)) {
            const finalVariants = expandVariantsPayload(variantsData, files, mainImage)
                .map((variant) => ({
                    ...variant,
                    product_id: newProduct.id
                }));
            await VariantModel.bulkCreate(finalVariants, { transaction: t });
        }

        await t.commit();
        res.status(201).json({ success: true, message: "Thêm thành công!", data: newProduct });

    } catch (error) {
        if (t) await t.rollback(); 
        console.error('❌ Error creating product:', error);
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
        const variantsData = variants
            ? (typeof variants === 'string' ? JSON.parse(variants) : variants)
            : [];

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

        const imageFiles = files.filter(f => f.fieldname === 'images');
        const existingImages = parseProductsImagesColumn(product.images);
        const byColorFromFiles = collectByColorExtraImages(variantsData, files);

        // Nếu có ảnh sản phẩm mới, ảnh đầu tiên sẽ là ảnh đại diện
        if (imageFiles.length > 0) {
            updateData.image = imageFiles[0].filename;
        }

        const shouldUpdateImages = imageFiles.length > 0 || Object.keys(byColorFromFiles).length > 0;
        if (shouldUpdateImages) {
            const commonImages = imageFiles.length > 0
                ? imageFiles.slice(1).map(file => file.filename)
                : existingImages.common;

            const mergedByColor = {
                ...existingImages.byColor,
                ...byColorFromFiles
            };

            updateData.images = (commonImages.length > 0 || Object.keys(mergedByColor).length > 0)
                ? { common: commonImages, byColor: mergedByColor }
                : null;
        }

        await product.update(updateData, { transaction: t });

        // Cập nhật biến thể
        if (Array.isArray(variantsData) && variants) {
            // Xóa các biến thể cũ
            await VariantModel.destroy({ where: { product_id: id }, transaction: t });

            // Thêm biến thể mới
            const fallbackImage = updateData.image || product.image || 'default.jpg';
            const finalVariants = expandVariantsPayload(variantsData, files, fallbackImage)
                .map((variant) => ({
                    ...variant,
                    product_id: id
                }));
            await VariantModel.bulkCreate(finalVariants, { transaction: t });
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

        // Xóa cart items liên quan đến variants của sản phẩm này trước
        await sequelize.query(`
            DELETE FROM cart_item 
            WHERE variant_id IN (
                SELECT id FROM variant WHERE product_id = ?
            )
        `, { 
            replacements: [id],
            transaction: t 
        });

        // Xóa biến thể
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