const db = require("../config/db");

exports.getAllProducts = async () => {

  const [rows] = await db.query(`
    
    SELECT 
    p.id,
    p.name,
    p.image,

    v.price,
    v.price_sale,

    r.avg_rating

FROM products p

/* variant có sale thấp nhất */
JOIN variant v 
    ON v.id = (
        SELECT v2.id
        FROM variant v2
        WHERE v2.product_id = p.id
        ORDER BY v2.price_sale ASC
        LIMIT 1
    )

/* rating trung bình */
LEFT JOIN (
    SELECT 
        v.product_id,
        AVG(orv.rating) AS avg_rating
    FROM variant v
    JOIN order_details od 
        ON od.variant_id = v.id
    JOIN order_review orv 
        ON orv.order_detail_id = od.id
    GROUP BY v.product_id
) r 
ON r.product_id = p.id;

  `);

  return rows;
};
exports.getProductDetail = async (productId) => {
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

exports.getProductReviews = async (productId) => {

  const sql = `
    SELECT 
        u.name AS user_name,
        CONCAT(c.table_color, ' - ', s.bang_size) AS variant_name,
        orv.comment AS review_content,
        orv.rating,
        orv.created_at AS review_date

    FROM order_review orv

    JOIN order_details od
        ON orv.order_detail_id = od.id

    JOIN orders o
        ON od.order_id = o.id

    JOIN users u
        ON o.user_id = u.id

    JOIN variant v
        ON od.variant_id = v.id

    JOIN color c
        ON v.color_id = c.id

    JOIN size s
        ON v.size_id = s.size_id

    WHERE v.product_id = ?

    ORDER BY orv.created_at DESC
  `;

  const [rows] = await db.query(sql, [productId]);

  return rows;
};

exports.getProductsByBrand = async (brandId) => {

  const sql = `
    SELECT 
        p.id,
        p.name,
        p.image,

        MIN(v.price) AS price,
        MIN(v.price_sale) AS price_sale,

        ROUND(AVG(orv.rating),1) AS avg_rating

    FROM products p

    JOIN variant v 
        ON v.product_id = p.id

    LEFT JOIN order_details od
        ON od.variant_id = v.id

    LEFT JOIN order_review orv
        ON orv.order_detail_id = od.id

    WHERE p.brand_id = ?

    GROUP BY p.id
    ORDER BY p.id DESC
  `;

  const [rows] = await db.query(sql, [brandId]);
  return rows;
};

exports.getProductsByCategory = async (categoryId) => {

  const sql = `
    SELECT 
        p.id,
        p.name,
        p.image,

        MIN(v.price) AS price,
        MIN(v.price_sale) AS price_sale,

        ROUND(AVG(orv.rating),1) AS avg_rating

    FROM products p

    JOIN variant v 
        ON v.product_id = p.id

    LEFT JOIN order_details od
        ON od.variant_id = v.id

    LEFT JOIN order_review orv
        ON orv.order_detail_id = od.id

    WHERE p.category_id = ?

    GROUP BY p.id
    ORDER BY p.id DESC
  `;

  const [rows] = await db.query(sql, [categoryId]);
  return rows;
};