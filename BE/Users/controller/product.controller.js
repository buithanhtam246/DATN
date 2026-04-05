const { sequelize } = require('../../config/database');

class ProductController {
  // Lấy tất cả sản phẩm để hiển thị cho người dùng
  async getAllProducts(req, res) {
    try {
      console.log('📍 getAllProducts called');
      const { limit, sort, category_id, exclude_id } = req.query;
      const limitNum = limit ? Math.min(parseInt(limit), 50) : 50;
      const categoryIdNum = category_id ? parseInt(category_id, 10) : null;
      const excludeIdNum = exclude_id ? parseInt(exclude_id, 10) : null;
      
      const models = sequelize.models;
      const ProductModel = models.products || models.Product;
      const VariantModel = models.variant || models.Variant || models.ProductVariant;

      if (!ProductModel) {
        return res.status(500).json({
          success: false,
          message: 'Model Product chưa load'
        });
      }

      if (!VariantModel) {
        return res.status(500).json({
          success: false,
          message: 'Model Variant chưa load'
        });
      }

      // Cách đơn giản: dùng raw query
      // Filter chỉ lấy sản phẩm có category active và brand active
      const orderBy = sort === 'newest' ? 'p.id DESC' : 'p.id DESC';
      const whereConditions = [
        '(c.status = 1 OR c.status IS NULL)',
        '(parent_cat.status = 1 OR parent_cat.status IS NULL OR c.parent_id IS NULL)',
        '(b.status = 1 OR b.status IS NULL)'
      ];
      const replacements = [];

      if (Number.isInteger(categoryIdNum) && categoryIdNum > 0) {
        whereConditions.push('p.category_id = ?');
        replacements.push(categoryIdNum);
      }

      if (Number.isInteger(excludeIdNum) && excludeIdNum > 0) {
        whereConditions.push('p.id <> ?');
        replacements.push(excludeIdNum);
      }

      replacements.push(limitNum);
      const data = await sequelize.query(`
        SELECT 
          p.id, 
          p.name, 
          p.image, 
          p.category_id, 
          p.brand_id,
          c.name as category_name,
          c.status as category_status,
          c.parent_id,
          b.name as brand_name,
          b.status as brand_status
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN categories parent_cat ON c.parent_id = parent_cat.id
        LEFT JOIN brand b ON p.brand_id = b.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ${orderBy}
        LIMIT ?
      `, { 
        replacements,
        type: sequelize.QueryTypes.SELECT 
      });

      console.log('✅ Products fetched:', data.length);

      // Lấy variants cho mỗi product
      const productsWithVariants = await Promise.all(
        data.map(async (product) => {
          const variants = await sequelize.query(`
            SELECT id, color_id, size_id, price, price_sale, quantity, image
            FROM variant
            WHERE product_id = ?
          `, { 
            replacements: [product.id],
            type: sequelize.QueryTypes.SELECT 
          });
          
          return {
            ...product,
            variants: variants || []
          };
        })
      );

      console.log('✅ Variants loaded, total products:', productsWithVariants.length);

      // Trả về sản phẩm với variants
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách sản phẩm thành công',
        data: productsWithVariants
      });
    } catch (error) {
      console.error('getAllProducts error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn: ' + error.message
      });
    }
  }

  // Lấy chi tiết sản phẩm
  async getProductById(req, res) {
    try {
      const { id } = req.params;

      // Thử query với cột images trước, nếu không tồn tại thì fallback
      let product;
      try {
        product = await sequelize.query(`
          SELECT 
            p.id, 
            p.name, 
            p.image, 
            p.images,
            p.category_id, 
            p.brand_id,
            c.name as category_name,
            c.status as category_status,
            c.parent_id,
            b.name as brand_name,
            b.status as brand_status
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN categories parent_cat ON c.parent_id = parent_cat.id
          LEFT JOIN brand b ON p.brand_id = b.id
          WHERE p.id = ? 
            AND (c.status = 1 OR c.status IS NULL) 
            AND (parent_cat.status = 1 OR parent_cat.status IS NULL OR c.parent_id IS NULL)
            AND (b.status = 1 OR b.status IS NULL)
        `, { 
          replacements: [id],
          type: sequelize.QueryTypes.SELECT 
        });
      } catch (e) {
        // Nếu cột images không tồn tại, query lại mà không có images
        console.log('Column images not found, querying without it');
        product = await sequelize.query(`
          SELECT 
            p.id, 
            p.name, 
            p.image, 
            p.category_id, 
            p.brand_id,
            c.name as category_name,
            c.status as category_status,
            c.parent_id,
            b.name as brand_name,
            b.status as brand_status
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN categories parent_cat ON c.parent_id = parent_cat.id
          LEFT JOIN brand b ON p.brand_id = b.id
          WHERE p.id = ? 
            AND (c.status = 1 OR c.status IS NULL) 
            AND (parent_cat.status = 1 OR parent_cat.status IS NULL OR c.parent_id IS NULL)
            AND (b.status = 1 OR b.status IS NULL)
        `, { 
          replacements: [id],
          type: sequelize.QueryTypes.SELECT 
        });
      }

      if (!product || product.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Sản phẩm không tồn tại'
        });
      }

      const variants = await sequelize.query(`
        SELECT 
          v.id, 
          v.color_id, 
          v.size_id, 
          v.price, 
          v.price_sale, 
          v.quantity, 
          v.image,
          c.name as color_name,
          c.hex_code as color_code,
          s.size as size_name
        FROM variant v
        LEFT JOIN color c ON v.color_id = c.id
        LEFT JOIN size s ON v.size_id = s.id
        WHERE v.product_id = ?
      `, { 
        replacements: [id],
        type: sequelize.QueryTypes.SELECT 
      });

      let variantImagesByVariantId = {};
      const variantIds = (variants || [])
        .map(item => Number(item.id))
        .filter(variantId => Number.isFinite(variantId) && variantId > 0);

      if (variantIds.length > 0) {
        try {
          const variantPlaceholders = variantIds.map(() => '?').join(', ');
          const variantImages = await sequelize.query(`
            SELECT
              variant_id,
              image_url,
              is_primary,
              id
            FROM product_images
            WHERE variant_id IN (${variantPlaceholders})
            ORDER BY variant_id ASC, is_primary DESC, id ASC
          `, {
            replacements: variantIds,
            type: sequelize.QueryTypes.SELECT
          });

          variantImagesByVariantId = (variantImages || []).reduce((acc, row) => {
            const variantId = Number(row.variant_id);
            if (!Number.isFinite(variantId) || variantId <= 0) {
              return acc;
            }

            if (!acc[variantId]) {
              acc[variantId] = [];
            }

            if (row.image_url) {
              acc[variantId].push(row.image_url);
            }

            return acc;
          }, {});
        } catch (error) {
          console.warn('⚠️ Skip loading product_images for user API:', error.message);
          variantImagesByVariantId = {};
        }
      }

      // Parse images JSON array/object
      let images = [];
      let imagesByColor = {};
      
      // Nếu product có images array từ database
      if (product[0].images) {
        let imagesArray = product[0].images;

        // Dữ liệu cũ có thể bị stringify nhiều lần, nên parse tối đa 2 lần
        for (let i = 0; i < 2 && typeof imagesArray === 'string'; i += 1) {
          try {
            imagesArray = JSON.parse(imagesArray);
          } catch (e) {
            console.warn('Failed to parse images JSON:', e);
            break;
          }
        }

        if (Array.isArray(imagesArray)) {
          // Format cũ: images là mảng ảnh phụ chung
          images = imagesArray.filter(img => img);
        } else if (imagesArray && typeof imagesArray === 'object') {
          // Format mới: { common: string[], byColor: Record<colorId, string[]> }
          const commonImages = Array.isArray(imagesArray.common)
            ? imagesArray.common.filter(img => img)
            : [];

          const byColorRaw = imagesArray.byColor && typeof imagesArray.byColor === 'object'
            ? imagesArray.byColor
            : {};

          imagesByColor = Object.entries(byColorRaw).reduce((acc, [colorId, imageList]) => {
            const normalized = Array.isArray(imageList)
              ? imageList.filter(img => img)
              : [];

            if (normalized.length > 0) {
              acc[colorId] = normalized;
            }

            return acc;
          }, {});

          images = commonImages;
        }
      }
      
      // Nếu không có ảnh phụ, dùng ảnh chính
      if (images.length === 0 && product[0].image) {
        images.push(product[0].image);
      }

      res.status(200).json({
        success: true,
        message: 'Lấy chi tiết sản phẩm thành công',
        data: {
          ...product[0],
          images: images,
          images_by_color: imagesByColor,
          variants: (variants || []).map((variant) => {
            const variantImages = variantImagesByVariantId[variant.id] || [];
            const fallbackImage = variant.image ? [variant.image] : [];
            const mergedImages = [...variantImages, ...fallbackImage].filter(Boolean);

            return {
              ...variant,
              images: Array.from(new Set(mergedImages))
            };
          })
        }
      });
    } catch (error) {
      console.error('getProductById error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn: ' + error.message
      });
    }
  }

  // Tìm kiếm sản phẩm
  async searchProducts(req, res) {
    try {
      const { keyword, category_id, brand_id } = req.query;

      let whereCondition = 'WHERE (c.status = 1 OR c.status IS NULL) AND (parent_cat.status = 1 OR parent_cat.status IS NULL OR c.parent_id IS NULL) AND (b.status = 1 OR b.status IS NULL)';
      const params = [];

      if (keyword) {
        whereCondition += ' AND p.name LIKE ?';
        params.push(`%${keyword}%`);
      }

      if (category_id) {
        whereCondition += ' AND p.category_id = ?';
        params.push(category_id);
      }

      if (brand_id) {
        whereCondition += ' AND p.brand_id = ?';
        params.push(brand_id);
      }

      const query = `
        SELECT 
          p.id, 
          p.name, 
          p.image, 
          p.category_id, 
          p.brand_id,
          c.name as category_name,
          c.status as category_status,
          c.parent_id,
          b.name as brand_name,
          b.status as brand_status
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN categories parent_cat ON c.parent_id = parent_cat.id
        LEFT JOIN brand b ON p.brand_id = b.id
        ${whereCondition}
        ORDER BY p.id DESC
      `;

      const data = await sequelize.query(query, {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      });

      // Lấy variants cho mỗi product
      const productsWithVariants = await Promise.all(
        data.map(async (product) => {
          const variants = await sequelize.query(`
            SELECT id, color_id, size_id, price, price_sale, quantity, image
            FROM variant
            WHERE product_id = ?
          `, { 
            replacements: [product.id],
            type: sequelize.QueryTypes.SELECT 
          });
          
          return {
            ...product,
            variants: variants || []
          };
        })
      );

      res.status(200).json({
        success: true,
        message: 'Tìm kiếm thành công',
        data: productsWithVariants
      });
    } catch (error) {
      console.error('searchProducts error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn: ' + error.message
      });
    }
  }

  // Lấy tồn kho cho nhiều variants
  async getVariantsInventory(req, res) {
    try {
      const { variant_ids } = req.body;

      if (!variant_ids || !Array.isArray(variant_ids) || variant_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'variant_ids is required and must be an array'
        });
      }

      const placeholders = variant_ids.map(() => '?').join(',');
      const variants = await sequelize.query(`
        SELECT id as variant_id, quantity
        FROM variant
        WHERE id IN (${placeholders})
      `, {
        replacements: variant_ids,
        type: sequelize.QueryTypes.SELECT
      });

      res.status(200).json({
        success: true,
        message: 'Lấy tồn kho thành công',
        data: variants
      });
    } catch (error) {
      console.error('getVariantsInventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn: ' + error.message
      });
    }
  }
}

module.exports = new ProductController();
