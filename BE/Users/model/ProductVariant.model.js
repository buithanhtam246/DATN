const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ProductVariant = sequelize.define('variant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'products', // Tên bảng sản phẩm chính
      key: 'id'
    }
  },
  color_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'colors',
      key: 'id'
    }
  },
  size_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sizes',
      key: 'id'
    }
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: null
  },
  price_sale: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: null
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'variant', // Thay đổi nếu tên bảng trong DB của bạn khác
  timestamps: false
});

module.exports = ProductVariant;