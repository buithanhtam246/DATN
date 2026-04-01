const db = require('../config/db');

class ProductAdminRepository {
  // Get all products with basic info (for admin list)
  async getAllProductsAdminList() {
    try {
      const [rows] = await db.query(`
        SELECT 
          id, 
          name, 
          brand, 
          category, 
          price, 
          description, 
          status
        FROM products
        ORDER BY id DESC
      `);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  // Get product by ID (for admin)
  async getProductByIdAdmin(productId) {
    try {
      const [rows] = await db.query(`
        SELECT 
          id, 
          name, 
          brand, 
          category, 
          price, 
          description, 
          status
        FROM products
        WHERE id = ?
      `, [productId]);
      return rows[0] || null;
    } catch (err) {
      throw err;
    }
  }

  // Get all variants for a product
  async getVariantsByProductId(productId) {
    try {
      const [rows] = await db.query(`
        SELECT 
          id, 
          product_id, 
          name, 
          color, 
          size, 
          stock, 
          image
        FROM product_variants
        WHERE product_id = ?
        ORDER BY id DESC
      `, [productId]);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  // Create product (for admin)
  async createProductAdmin(data) {
    try {
      const { name, brand, category, price, description, status } = data;
      const [result] = await db.query(`
        INSERT INTO products 
        (name, brand, category, price, description, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [name, brand, category, price || 0, description || '', status || 1]);
      
      return result.insertId;
    } catch (err) {
      throw err;
    }
  }

  // Update product (for admin)
  async updateProductAdmin(productId, data) {
    try {
      const { name, brand, category, price, description, status } = data;
      await db.query(`
        UPDATE products 
        SET name = ?, brand = ?, category = ?, price = ?, description = ?, status = ?
        WHERE id = ?
      `, [name, brand, category, price || 0, description || '', status || 1, productId]);
    } catch (err) {
      throw err;
    }
  }

  // Delete product (for admin)
  async deleteProductAdmin(productId) {
    try {
      // Delete variants first
      await db.query(`
        DELETE FROM product_variants WHERE product_id = ?
      `, [productId]);
      
      // Then delete product
      await db.query(`
        DELETE FROM products WHERE id = ?
      `, [productId]);
    } catch (err) {
      throw err;
    }
  }

  // Create variant (for admin)
  async createVariantAdmin(productId, data) {
    try {
      const { name, color, size, stock, image } = data;
      const [result] = await db.query(`
        INSERT INTO product_variants 
        (product_id, name, color, size, stock, image)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [productId, name, color || '#000000', size || '', stock || 0, image || '']);
      
      return result.insertId;
    } catch (err) {
      throw err;
    }
  }

  // Update variant (for admin)
  async updateVariantAdmin(variantId, data) {
    try {
      const { name, color, size, stock, image } = data;
      await db.query(`
        UPDATE product_variants 
        SET name = ?, color = ?, size = ?, stock = ?, image = ?
        WHERE id = ?
      `, [name, color || '#000000', size || '', stock || 0, image || '', variantId]);
    } catch (err) {
      throw err;
    }
  }

  // Delete variant (for admin)
  async deleteVariantAdmin(variantId) {
    try {
      await db.query(`
        DELETE FROM product_variants WHERE id = ?
      `, [variantId]);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new ProductAdminRepository();
