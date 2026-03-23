const Product = require("../models/product.model");
const { PRODUCT_IMAGE_PATH } = require("../config/constants");

const mapImage = (p) => ({
  ...p,
  image: p.image ? PRODUCT_IMAGE_PATH + p.image : null
});

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.json({ success: true, data: products.map(mapImage) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductDetail = async (req, res) => {
  try {

    const productId = Number(req.params.id);
    if (!productId) return res.status(400).json({ message: "Invalid id" });

    const rows = await Product.getProductDetail(productId);
    if (!rows.length) return res.status(404).json({ message: "Not found" });

    const product = {
      id: rows[0].productId,
      name: rows[0].name,
      description: rows[0].describ,
      image: PRODUCT_IMAGE_PATH + rows[0].productImage,
      brand: rows[0].brand,
      colors: []
    };

    const colorMap = {};

    rows.forEach(r => {
      if (!colorMap[r.colorId]) {
        colorMap[r.colorId] = {
          colorId: r.colorId,
          colorCode: r.table_color,
          image: r.image ? PRODUCT_IMAGE_PATH + r.image : null,
          sizes: []
        };
        product.colors.push(colorMap[r.colorId]);
      }

      colorMap[r.colorId].sizes.push({
        sizeId: r.size_id,
        sizeName: r.bang_size,
        variantId: r.variantId,
        price: r.price,
        priceSale: r.price_sale,
        quantity: r.quantity
      });
    });

    res.json({ success: true, data: product });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const data = await Product.getProductReviews(productId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRelatedProducts = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const data = await Product.getRelatedProducts(productId);
    res.json({ success: true, data: data.map(mapImage) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductsByBrand = async (req, res) => {
  try {
    const data = await Product.getProductsByBrand(req.params.brandId);
    res.json({ success: true, data: data.map(mapImage) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const data = await Product.getProductsByCategory(req.params.categoryId);
    res.json({ success: true, data: data.map(mapImage) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getNewProducts = async (req, res) => {
  try {
    const data = await Product.getNewProducts();
    res.json({ success: true, data: data.map(mapImage) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBestSellingProducts = async (req, res) => {
  try {
    const data = await Product.getBestSellingProducts();
    res.json({ success: true, data: data.map(mapImage) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productId = await Product.createProduct(req.body);
    res.json({ success: true, productId });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.generateVariants = async (req, res) => {
  try {
    const { productId, colors, sizes } = req.body;
    await Product.generateVariants(productId, colors, sizes);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateVariant = async (req, res) => {
  try {
    await Product.updateVariant(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};