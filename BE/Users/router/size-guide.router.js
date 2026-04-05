const express = require('express');
const router = express.Router();
const { sequelize } = require('../../config/database');

/**
 * Get size guide image by category ID
 * GET /api/size-guides/category/:categoryId
 * Nếu category là child (parent_id != null), lấy guide từ parent category
 */
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log('📍 Size guide request for category:', categoryId);

    // Lấy category info
    const [category] = await sequelize.query(`
      SELECT id, name, parent_id, status, size_guide_image_url
      FROM categories
      WHERE id = ? AND status = 1
    `, {
      replacements: [categoryId],
      type: sequelize.QueryTypes.SELECT
    });

    console.log('✅ Category found:', category);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Nếu category có parent_id (là child category), lấy guide từ parent
    let guideCategory = category;
    if (category.parent_id) {
      console.log('📌 Category has parent_id:', category.parent_id);
      const [parentCategory] = await sequelize.query(`
        SELECT id, name, parent_id, status, size_guide_image_url
        FROM categories
        WHERE id = ? AND status = 1
      `, {
        replacements: [category.parent_id],
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log('✅ Parent category found:', parentCategory);
      if (parentCategory) {
        guideCategory = parentCategory;
      }
    }

    // Check xem có image không
    console.log('🖼️ Guide category:', guideCategory.name, 'Image URL:', guideCategory.size_guide_image_url);
    
    if (!guideCategory.size_guide_image_url) {
      return res.status(404).json({
        success: false,
        message: 'Size guide not found for this category'
      });
    }

    res.json({
      success: true,
      data: {
        category_id: guideCategory.id,
        category_name: guideCategory.name,
        image_url: guideCategory.size_guide_image_url
      }
    });
  } catch (error) {
    console.error('Error fetching size guide:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching size guide',
      error: error.message
    });
  }
});

module.exports = router;
