const { sequelize } = require('../../config/database');

class ProductRepository {
  async findAll() {
    try {
      const models = sequelize.models;
      const ProductModel = models.products || models.Product;
      const VariantModel = models.variant || models.Variant || models.product_variants;

      return await ProductModel.findAll({
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT name FROM categories AS cat
                WHERE cat.id = products.category_id
                LIMIT 1
              )`),
              'category_name'
            ],
            [
              sequelize.literal(`(
                SELECT name FROM brand AS br
                WHERE br.id = products.brand_id
                LIMIT 1
              )`),
              'brand_name'
            ]
          ]
        },
        include: [
          {
            model: VariantModel,
            as: 'variants',
            attributes: ['id', 'color_id', 'size_id', 'price', 'price_sale', 'quantity', 'image'],
            required: false
          }
        ],
        order: [['id', 'DESC']]
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const models = sequelize.models;
      const ProductModel = models.products || models.Product;
      const VariantModel = models.variant || models.Variant || models.product_variants;

      return await ProductModel.findByPk(id, {
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT name FROM categories AS cat
                WHERE cat.id = products.category_id
                LIMIT 1
              )`),
              'category_name'
            ],
            [
              sequelize.literal(`(
                SELECT name FROM brand AS br
                WHERE br.id = products.brand_id
                LIMIT 1
              )`),
              'brand_name'
            ]
          ]
        },
        include: [
          {
            model: VariantModel,
            as: 'variants',
            attributes: ['id', 'color_id', 'size_id', 'price', 'price_sale', 'quantity', 'image'],
            required: false
          }
        ]
      });
    } catch (error) {
      throw error;
    }
  }

  async search(filters) {
    try {
      const models = sequelize.models;
      const ProductModel = models.products || models.Product;
      const VariantModel = models.variant || models.Variant || models.product_variants;

      let whereClause = {};
      
      if (filters.keyword) {
        whereClause.name = {
          [sequelize.Op.like]: `%${filters.keyword}%`
        };
      }
      
      if (filters.category_id) {
        whereClause.category_id = filters.category_id;
      }
      
      if (filters.brand_id) {
        whereClause.brand_id = filters.brand_id;
      }

      return await ProductModel.findAll({
        where: whereClause,
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT name FROM categories AS cat
                WHERE cat.id = products.category_id
                LIMIT 1
              )`),
              'category_name'
            ],
            [
              sequelize.literal(`(
                SELECT name FROM brand AS br
                WHERE br.id = products.brand_id
                LIMIT 1
              )`),
              'brand_name'
            ]
          ]
        },
        include: [
          {
            model: VariantModel,
            as: 'variants',
            attributes: ['id', 'color_id', 'size_id', 'price', 'price_sale', 'quantity', 'image'],
            required: false
          }
        ],
        order: [['id', 'DESC']]
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductRepository();
