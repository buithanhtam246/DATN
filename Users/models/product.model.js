const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // giả sử bạn đã config sequelize

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  brand_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  describ: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  material: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  date_add: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'products',
  timestamps: false,
});

Product.associate = (models) => {
  Product.belongsTo(models.Brand, { foreignKey: 'brand_id' });
  Product.belongsTo(models.Category, { foreignKey: 'category_id' });
  Product.hasMany(models.Variant, { foreignKey: 'product_id', as: 'variants' });
};

module.exports = Product;