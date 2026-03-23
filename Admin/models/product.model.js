const db = require("../config/db");
const Product = {};

// helper: chọn giá thấp nhất (ưu tiên sale)
const PRICE_ORDER = `
  ORDER BY 
    CASE 
      WHEN v2.price_sale IS NULL OR v2.price_sale = 0 
      THEN v2.price 
      ELSE v2.price_sale 
    END ASC
`;

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
        ${PRICE_ORDER}
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

Product.getProductDetail = async (productId) => {

  const [rows] = await db.query(`
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
  `, [productId]);

  return rows;
};

Product.getProductReviews = async (productId) => {

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
};

Product.getRelatedProducts = async (productId) => {

  const [product] = await db.query(`
    SELECT brand_id, category_id
    FROM products
    WHERE id = ?
  `, [productId]);

  if (!product.length) return [];

  const { brand_id, category_id } = product[0];

  const [rows] = await db.query(`
    SELECT DISTINCT p.id, p.name, p.image
    FROM products p
    WHERE p.id != ?
    ORDER BY 
      (p.brand_id = ?) DESC,
      (p.category_id = ?) DESC,
      p.id DESC
    LIMIT 10
  `, [productId, brand_id, category_id]);

  return rows;
};

Product.getProductsByBrand = async (brandId) => {

  const [rows] = await db.query(`
    SELECT 
        p.id,
        p.name,
        p.image,

        MIN(v.price) AS price,
        MIN(v.price_sale) AS price_sale,

        r.avg_rating,
        IFNULL(s.total_sold,0) AS total_sold

    FROM products p
    JOIN variant v ON v.product_id = p.id

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

    WHERE p.brand_id = ?
    GROUP BY p.id
    ORDER BY total_sold DESC
  `, [brandId]);

  return rows;
};

Product.getProductsByCategory = async (categoryId) => {

  const [rows] = await db.query(`
    SELECT 
        p.id,
        p.name,
        p.image,

        MIN(v.price) AS price,
        MIN(v.price_sale) AS price_sale,

        r.avg_rating,
        IFNULL(s.total_sold,0) AS total_sold

    FROM products p
    JOIN variant v ON v.product_id = p.id

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

    WHERE p.category_id = ?
    GROUP BY p.id
    ORDER BY total_sold DESC
  `, [categoryId]);

  return rows;
};

Product.getNewProducts = async () => {
  return (await Product.getAllProducts()).slice(0, 10);
};

Product.getBestSellingProducts = async () => {

  const [rows] = await db.query(`
    SELECT 
        p.id,
        p.name,
        p.image,
        SUM(od.quantity) as total_sold

    FROM products p
    JOIN variant v ON v.product_id = p.id
    JOIN order_details od ON od.variant_id = v.id

    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT 10
  `);

  return rows;
};

Product.createProduct = async (data) => {

  const [result] = await db.query(`
    INSERT INTO products (name, describ, brand_id, category_id, image)
    VALUES (?, ?, ?, ?, ?)
  `, [
    data.name,
    data.describ,
    data.brand_id,
    data.category_id,
    data.image || null
  ]);

  return result.insertId;
};

Product.generateVariants = async (productId, colors, sizes) => {

  if (!colors.length || !sizes.length) return;

  const variants = [];

  colors.forEach(color => {
    sizes.forEach(size => {
      variants.push([productId, color, size, 0, 0, 0, null]);
    });
  });

  await db.query(`
    INSERT INTO variant
    (product_id, color_id, size_id, price, price_sale, quantity, image)
    VALUES ?
  `, [variants]);
};

Product.updateVariant = async (variantId, data) => {

  await db.query(`
    UPDATE variant
    SET price = ?, price_sale = ?, quantity = ?, image = ?
    WHERE id = ?
  `, [
    data.price,
    data.price_sale,
    data.quantity,
    data.image,
    variantId
  ]);
};

module.exports = Product;