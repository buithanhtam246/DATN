const db = require("../config/db");

const Product = {};

// ======================= GET ALL =======================
Product.getAllProducts = async () => {
  const [rows] = await db.query(`
    SELECT 
        p.id,
        p.name,
        p.image,
        v.price,
        v.price_sale,
        r.avg_rating,
        IFNULL(s.total_sold,0) AS total_sold
    FROM products p
    JOIN variant v 
        ON v.id = (
            SELECT v2.id
            FROM variant v2
            WHERE v2.product_id = p.id
            ORDER BY v2.price_sale ASC
            LIMIT 1
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
        FROM variant v
        JOIN order_details od ON od.variant_id = v.id
        GROUP BY v.product_id
    ) s ON s.product_id = p.id
  `);

  return rows;
};

// ======================= DETAIL =======================
Product.getProductDetail = async (productId) => {
  const [rows] = await db.query(
    `
    SELECT 
        p.id as productId,
        p.name,
        p.describ,
        p.image as productImage,
        b.name as brand,

        v.id as variantId,
        v.price,
        v.price_sale,
        v.quantity,
        v.image,

        c.id as colorId,
        c.table_color,

        s.size_id,
        s.bang_size

    FROM products p
    JOIN brand b ON p.brand_id = b.id
    JOIN variant v ON v.product_id = p.id
    JOIN color c ON v.color_id = c.id
    JOIN size s ON v.size_id = s.size_id

    WHERE p.id = ?
    `,
    [productId]
  );

  return rows;
};

// ======================= REVIEWS =======================
Product.getProductReviews = async (productId) => {
  const [rows] = await db.query(
    `
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
    `,
    [productId]
  );

  return rows;
};

// ======================= RELATED =======================
Product.getRelatedProducts = async (productId) => {
  const [product] = await db.query(
    `SELECT brand_id, category_id FROM products WHERE id = ?`,
    [productId]
  );

  if (product.length === 0) return [];

  const { brand_id, category_id } = product[0];

  const [rows] = await db.query(
    `
    SELECT p.id, p.name, p.image
    FROM products p
    WHERE p.id != ?
    AND (p.brand_id = ? OR p.category_id = ?)
    LIMIT 10
    `,
    [productId, brand_id, category_id]
  );

  return rows;
};

// ======================= BRAND =======================
Product.getProductsByBrand = async (brandId) => {
  const [rows] = await db.query(
    `
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
    `,
    [brandId]
  );

  return rows;
};

// ======================= CATEGORY =======================
Product.getProductsByCategory = async (categoryId) => {
  const [rows] = await db.query(
    `
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
    `,
    [categoryId]
  );

  return rows;
};

// ======================= NEW =======================
Product.getNewProducts = async () => {
  const [rows] = await db.query(`
    SELECT id, name, image
    FROM products
    ORDER BY id DESC
    LIMIT 10
  `);

  return rows;
};

// ======================= BEST SELL =======================
Product.getBestSellingProducts = async () => {
  const [rows] = await db.query(`
    SELECT p.id, p.name, p.image, SUM(od.quantity) as total_sold
    FROM products p
    JOIN variant v ON v.product_id = p.id
    JOIN order_details od ON od.variant_id = v.id
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT 10
  `);

  return rows;
};

module.exports = Product;