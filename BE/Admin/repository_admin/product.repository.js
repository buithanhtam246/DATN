const db = require('../config/db'); // mysql2/promise hoặc knex

class ProductRepository {
    async getAllProducts() {
        const [rows] = await db.query(`
      SELECT 
          p.id, p.name, p.image,
          v.price, v.price_sale,
          r.avg_rating,
          IFNULL(s.total_sold, 0) AS total_sold
      FROM products p
      JOIN variant v ON v.id = (
          SELECT v2.id FROM variant v2 
          WHERE v2.product_id = p.id 
          ORDER BY v2.price_sale ASC LIMIT 1
      )
      LEFT JOIN (
          SELECT v.product_id, AVG(orv.rating) AS avg_rating
          FROM variant v
          JOIN order_details od ON od.variant_id = v.id
          JOIN order_review orv ON orv.order_detail_id = od.id
          GROUP BY v.product_id
      ) r ON r.product_id = p.id
      LEFT JOIN (
          SELECT v.product_id, SUM(od.quantity) AS total_sold
          FROM variant v JOIN order_details od ON od.variant_id = v.id
          GROUP BY v.product_id
      ) s ON s.product_id = p.id
    `);
        return rows;
    }

    async getProductDetail(productId) {
        const [rows] = await db.query(`
      SELECT 
          p.id as productId, p.name, p.describ, p.image as productImage,
          b.name as brand,
          v.id as variantId, v.price, v.price_sale, v.quantity, v.image,
          c.id as colorId, c.table_color,
          s.size_id, s.bang_size
      FROM products p
      JOIN brand b ON p.brand_id = b.id
      JOIN variant v ON v.product_id = p.id
      JOIN color c ON v.color_id = c.id
      JOIN size s ON v.size_id = s.size_id
      WHERE p.id = ?
    `, [productId]);
        return rows;
    }

    async getProductReviews(productId) {
        const [rows] = await db.query(`
      SELECT 
          u.name AS user_name,
          CONCAT(c.table_color, ' - ', s.bang_size) AS variant_name,
          orv.comment AS review_content,
          orv.rating,
          orv.created_at AS review_date
      FROM order_review orv
      JOIN order_details od ON orv.order_detail_id = od.id
      JOIN orders o ON od.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN variant v ON od.variant_id = v.id
      JOIN color c ON v.color_id = c.id
      JOIN size s ON v.size_id = s.size_id
      WHERE v.product_id = ?
      ORDER BY orv.created_at DESC
    `, [productId]);
        return rows;
    }

    async getRelatedProducts(productId) {
        const [product] = await db.query(
            'SELECT id, brand_id, category_id FROM products WHERE id = ?',
            [productId]
        );
        if (!product.length) return [];

        const { brand_id: brandId, category_id: categoryId } = product[0];
        let result = [];
        let ids = new Set();

        const addProducts = (rows) => {
            rows.forEach(p => {
                if (!ids.has(p.id) && result.length < 10) {
                    ids.add(p.id);
                    result.push(p);
                }
            });
        };

        // 1. Cùng brand + category
        const [brandCate] = await db.query(
            'SELECT id, name, image FROM products WHERE brand_id = ? AND category_id = ? AND id != ? LIMIT 10',
            [brandId, categoryId, productId]
        );
        addProducts(brandCate);

        if (result.length >= 10) return result;

        // 2. Cùng category
        const [cate] = await db.query(
            'SELECT id, name, image FROM products WHERE category_id = ? AND id != ? LIMIT 10',
            [categoryId, productId]
        );
        addProducts(cate);

        if (result.length >= 10) return result;

        // 3. Cùng brand
        const [brand] = await db.query(
            'SELECT id, name, image FROM products WHERE brand_id = ? AND id != ? LIMIT 10',
            [brandId, productId]
        );
        addProducts(brand);

        if (result.length >= 10) return result;

        // 4. Bán chạy
        const [best] = await db.query(
            `SELECT p.id, p.name, p.image, SUM(od.quantity) as sold
       FROM products p
       JOIN variant v ON v.product_id = p.id
       JOIN order_details od ON od.variant_id = v.id
       WHERE p.id != ?
       GROUP BY p.id ORDER BY sold DESC LIMIT 10`,
            [productId]
        );
        addProducts(best);

        if (result.length >= 10) return result;

        // 5. Mới nhất
        const [newest] = await db.query(
            'SELECT id, name, image FROM products WHERE id != ? ORDER BY id DESC LIMIT 10',
            [productId]
        );
        addProducts(newest);

        return result;
    }

    async getProductsByBrand(brandId) {
        const sql = `
    SELECT 
        p.id,
        p.name,
        p.image,
        MIN(v.price) AS price,
        MIN(v.price_sale) AS price_sale,
        ROUND(AVG(orv.rating),1) AS avg_rating,
        IFNULL(SUM(od.quantity),0) AS total_sold
    FROM products p
    JOIN variant v ON v.product_id = p.id
    LEFT JOIN order_details od ON od.variant_id = v.id
    LEFT JOIN order_review orv ON orv.order_detail_id = od.id
    WHERE p.brand_id = ?
    GROUP BY p.id
    ORDER BY total_sold DESC
  `;
        const [rows] = await db.query(sql, [brandId]);
        return rows;
    }

    async getProductsByCategory(categoryId) {
        const sql = `
    SELECT 
        p.id,
        p.name,
        p.image,
        MIN(v.price) AS price,
        MIN(v.price_sale) AS price_sale,
        ROUND(AVG(orv.rating),1) AS avg_rating,
        IFNULL(SUM(od.quantity),0) AS total_sold
    FROM products p
    JOIN variant v ON v.product_id = p.id
    LEFT JOIN order_details od ON od.variant_id = v.id
    LEFT JOIN order_review orv ON orv.order_detail_id = od.id
    WHERE p.category_id = ?
    GROUP BY p.id
    ORDER BY total_sold DESC
  `;
        const [rows] = await db.query(sql, [categoryId]);
        return rows;
    }

    async getNewProducts() {
        const sql = `
    SELECT 
        p.id,
        p.name,
        p.image,
        v.price,
        v.price_sale,
        r.avg_rating,
        IFNULL(s.total_sold,0) AS total_sold
    FROM products p
    JOIN variant v ON v.id = (
        SELECT v2.id FROM variant v2 
        WHERE v2.product_id = p.id 
        ORDER BY v2.price_sale ASC LIMIT 1
    )
    LEFT JOIN (
        SELECT v.product_id, AVG(orv.rating) AS avg_rating
        FROM variant v
        JOIN order_details od ON od.variant_id = v.id
        JOIN order_review orv ON orv.order_detail_id = od.id
        GROUP BY v.product_id
    ) r ON r.product_id = p.id
    LEFT JOIN (
        SELECT v.product_id, SUM(od.quantity) AS total_sold
        FROM variant v JOIN order_details od ON od.variant_id = v.id
        GROUP BY v.product_id
    ) s ON s.product_id = p.id
    ORDER BY p.id DESC
    LIMIT 10
  `;
        const [rows] = await db.query(sql);
        return rows;
    }

    async getBestSellingProducts() {
        const sql = `
    SELECT 
        p.id,
        p.name,
        p.image,
        v.price,
        v.price_sale,
        r.avg_rating,
        IFNULL(s.total_sold,0) AS total_sold
    FROM products p
    JOIN variant v ON v.id = (
        SELECT v2.id FROM variant v2 
        WHERE v2.product_id = p.id 
        ORDER BY v2.price_sale ASC LIMIT 1
    )
    LEFT JOIN (
        SELECT v.product_id, AVG(orv.rating) AS avg_rating
        FROM variant v
        JOIN order_details od ON od.variant_id = v.id
        JOIN order_review orv ON orv.order_detail_id = od.id
        GROUP BY v.product_id
    ) r ON r.product_id = p.id
    LEFT JOIN (
        SELECT v.product_id, SUM(od.quantity) AS total_sold
        FROM variant v JOIN order_details od ON od.variant_id = v.id
        GROUP BY v.product_id
    ) s ON s.product_id = p.id
    ORDER BY total_sold DESC
    LIMIT 10
  `;
        const [rows] = await db.query(sql);
        return rows;
    }

    async createProduct(data) {
        const [result] = await db.query(
            'INSERT INTO products (name, describ, brand_id, category_id, image) VALUES (?, ?, ?, ?, ?)',
            [data.name, data.describ, data.brand_id, data.category_id, data.image]
        );
        return result.insertId;
    }

    async generateVariants(productId, colors, sizes) {
        const values = [];
        colors.forEach(color => {
            sizes.forEach(size => {
                values.push([productId, color, size, 0, 0, 0, null]);
            });
        });

        await db.query(
            'INSERT INTO variant (product_id, color_id, size_id, price, price_sale, quantity, image) VALUES ?',
            [values]
        );
    }

    async updateVariant(variantId, data) {
        await db.query(
            'UPDATE variant SET price = ?, price_sale = ?, quantity = ?, image = ? WHERE id = ?',
            [data.price, data.price_sale, data.quantity, data.image, variantId]
        );
    }
}

module.exports = new ProductRepository();