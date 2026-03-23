const Product = require("../models/product.model");
const { PRODUCT_IMAGE_PATH } = require("../config/constants");

// helper
const mapImage = (data) => {
  return data.map(item => ({
    ...item,
    image: PRODUCT_IMAGE_PATH + item.image
  }));
};

// ======================= GET ALL =======================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.json(mapImage(products));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= DETAIL =======================
exports.getProductDetail = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const rows = await Product.getProductDetail(productId);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    const product = {
      id: rows[0].productId,
      name: rows[0].name,
      description: rows[0].describ,
      image: PRODUCT_IMAGE_PATH + rows[0].productImage,
      brand: rows[0].brand,
      colors: [],
    };

    const colorMap = {};

    rows.forEach(row => {
      if (!colorMap[row.colorId]) {
        colorMap[row.colorId] = {
          colorId: row.colorId,
          colorCode: row.table_color,
          image: PRODUCT_IMAGE_PATH + row.image,
          sizes: []
        };
        product.colors.push(colorMap[row.colorId]);
      }

      colorMap[row.colorId].sizes.push({
        sizeId: row.size_id,
        sizeName: row.bang_size,
        variantId: row.variantId,
        price: row.price,
        priceSale: row.price_sale,
        quantity: row.quantity
      });
    });

    res.json(product);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= REVIEWS =======================
exports.getProductReviews = async (req, res) => {
  try {
    const data = await Product.getProductReviews(req.params.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= RELATED =======================
exports.getRelatedProducts = async (req, res) => {
  try {
    const products = await Product.getRelatedProducts(req.params.id);
    res.json({
      success: true,
      data: mapImage(products)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= BRAND =======================
exports.getProductsByBrand = async (req, res) => {
  try {
    const products = await Product.getProductsByBrand(req.params.brandId);
    res.json({
      success: true,
      data: mapImage(products)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= CATEGORY =======================
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.getProductsByCategory(req.params.categoryId);
    res.json({
      success: true,
      data: mapImage(products)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= NEW =======================
exports.getNewProducts = async (req, res) => {
  try {
    const products = await Product.getNewProducts();
    res.json({
      success: true,
      data: mapImage(products)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= BEST SELL =======================
exports.getBestSellingProducts = async (req, res) => {
  try {
    const products = await Product.getBestSellingProducts();
    res.json({
      success: true,
      data: mapImage(products)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};