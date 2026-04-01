const db = require('../config/db');

class ProductVariantService {
  
  /**
   * Create product with multiple variants (each variant has different price)
   * Input: {name, brand_id, category_id, description, material, variants: [{color, size, price, stock}, ...]}
   */
  async createProductWithVariants(data) {
    const { name, brand_id, category_id, description, material, variants } = data;
    
    try {
      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // 1. Create product
        const [productResult] = await connection.query(`
          INSERT INTO products (name, brand_id, category_id, description, material, date_add)
          VALUES (?, ?, ?, ?, ?, NOW())
        `, [name, brand_id, category_id, description, material]);

        const productId = productResult.insertId;

        // 2. Create variants for this product
        const variantIds = [];
        for (const variant of variants) {
          const [variantResult] = await connection.query(`
            INSERT INTO variant (product_id, color, size, price, quantity)
            VALUES (?, ?, ?, ?, ?)
          `, [
            productId,
            variant.color || '',
            variant.size || '',
            variant.price || 0,
            variant.stock || 0
          ]);
          variantIds.push(variantResult.insertId);
        }

        await connection.commit();
        connection.release();

        return {
          productId,
          variantIds,
          message: 'Product with variants created successfully'
        };
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * Add image to variant
   */
  async addImageToVariant(variantId, imageUrl, isPrimary = false) {
    try {
      const [result] = await db.query(`
        INSERT INTO product_images (variant_id, image_url, is_primary, created_at)
        VALUES (?, ?, ?, NOW())
      `, [variantId, imageUrl, isPrimary ? 1 : 0]);

      return result.insertId;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get product with all variants and their images
   */
  async getProductWithVariantsAndImages(productId) {
    try {
      // Get product
      const [products] = await db.query(`
        SELECT id, name, brand_id, category_id, description, material, date_add
        FROM products
        WHERE id = ?
      `, [productId]);

      if (!products.length) {
        return null;
      }

      const product = products[0];

      // Get variants with images
      const [variants] = await db.query(`
        SELECT 
          v.id,
          v.product_id,
          v.color,
          v.size,
          v.price,
          v.quantity,
          GROUP_CONCAT(
            JSON_OBJECT(
              'imageId', pi.id,
              'imageUrl', pi.image_url,
              'isPrimary', pi.is_primary
            )
          ) as images
        FROM variant v
        LEFT JOIN product_images pi ON v.id = pi.variant_id
        WHERE v.product_id = ?
        GROUP BY v.id
        ORDER BY v.id ASC
      `, [productId]);

      // Parse images JSON
      const parsedVariants = variants.map(v => ({
        id: v.id,
        product_id: v.product_id,
        color: v.color,
        size: v.size,
        price: v.price,
        quantity: v.quantity,
        images: v.images ? v.images.split(',').map(img => JSON.parse(img)) : []
      }));

      return {
        ...product,
        variants: parsedVariants
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete image from variant
   */
  async deleteImageFromVariant(imageId) {
    try {
      await db.query(`
        DELETE FROM product_images
        WHERE id = ?
      `, [imageId]);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update variant price
   */
  async updateVariantPrice(variantId, price) {
    try {
      await db.query(`
        UPDATE variant
        SET price = ?
        WHERE id = ?
      `, [price, variantId]);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update variant stock
   */
  async updateVariantStock(variantId, quantity) {
    try {
      await db.query(`
        UPDATE variant
        SET quantity = ?
        WHERE id = ?
      `, [quantity, variantId]);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get all products with summary (product + variant count + images count)
   */
  async getAllProductsWithSummary() {
    try {
      const [result] = await db.query(`
        SELECT 
          p.id,
          p.name,
          p.brand_id,
          p.category_id,
          p.description,
          COUNT(DISTINCT v.id) as variant_count,
          COUNT(DISTINCT pi.id) as image_count
        FROM products p
        LEFT JOIN variant v ON p.id = v.product_id
        LEFT JOIN product_images pi ON v.id = pi.variant_id
        GROUP BY p.id
        ORDER BY p.id DESC
      `);

      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new ProductVariantService();
