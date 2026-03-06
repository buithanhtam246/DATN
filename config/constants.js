require("dotenv").config();

const BASE_URL = process.env.BASE_URL;

module.exports = {
  BRAND_IMAGE_PATH: `${BASE_URL}/public/brands/`,
  PRODUCT_IMAGE_PATH: `${BASE_URL}/public/products/`,
  USER_IMAGE_PATH: `${BASE_URL}/public/users/`,
};