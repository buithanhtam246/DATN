const productService = require("../services/product.service");
const { PRODUCT_IMAGE_PATH } = require("../config/constants");

exports.getAllProducts = async (req, res) => {
  try {

    const products = await productService.getAllProducts();

    const data = products.map(p => ({
      ...p,
      image: PRODUCT_IMAGE_PATH + p.image
    }));

    res.json(data);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }
};


exports.getProductDetail = async (req, res) => {
  try {

    const productId = req.params.id;

    const rows = await productService.getProductDetail(productId);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
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

    rows.forEach((row) => {

      if (!colorMap[row.colorId]) {

        colorMap[row.colorId] = {
          colorId: row.colorId,
          colorCode: row.table_color,
          image: PRODUCT_IMAGE_PATH + row.image,
          sizes: [],
        };

        product.colors.push(colorMap[row.colorId]);

      }

      colorMap[row.colorId].sizes.push({
        sizeId: row.size_id,
        sizeName: row.bang_size,
        variantId: row.variantId,
        price: row.price,
        priceSale: row.price_sale,
        quantity: row.quantity,
      });

    });

    res.json(product);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }
};


exports.getProductReviews = async (req, res) => {

  try {

    const productId = req.params.id;

    const reviews = await productService.getProductReviews(productId);

    res.json(reviews);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};


exports.getRelatedProducts = async (req, res) => {

  try {

    const productId = req.params.id;

    const products = await productService.getRelatedProducts(productId);

    res.json({
      success: true,
      data: products
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};


exports.getProductsByBrand = async (req, res) => {

  try {

    const brandId = req.params.brandId;

    const products = await productService.getProductsByBrand(brandId);

    const data = products.map(p => ({
      ...p,
      image: PRODUCT_IMAGE_PATH + p.image
    }));

    res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};


exports.getProductsByCategory = async (req, res) => {

  try {

    const categoryId = req.params.categoryId;

    const products = await productService.getProductsByCategory(categoryId);

    const data = products.map(p => ({
      ...p,
      image: PRODUCT_IMAGE_PATH + p.image
    }));

    res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};


exports.getNewProducts = async (req, res) => {

  try {

    const products = await productService.getNewProducts();

    const data = products.map(p => ({
      ...p,
      image: PRODUCT_IMAGE_PATH + p.image
    }));

    res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};


exports.getBestSellingProducts = async (req, res) => {

  try {

    const products = await productService.getBestSellingProducts();

    const data = products.map(p => ({
      ...p,
      image: PRODUCT_IMAGE_PATH + p.image
    }));

    res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};


