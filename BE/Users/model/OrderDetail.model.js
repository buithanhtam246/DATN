const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const OrderDetail = sequelize.sequelize.define('order_details', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  variant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, {
  tableName: 'order_details',
  timestamps: false,
  constraints: false  // Bỏ Foreign Key constraint
});

// Association
OrderDetail.associate = (models) => {
  OrderDetail.belongsTo(models.Order, {
    foreignKey: 'order_id',
    as: 'order'
  });
  OrderDetail.belongsTo(models.ProductVariant, {
    foreignKey: 'variant_id',
    as: 'variant'
  });
  OrderDetail.hasMany(models.OrderReview, {
    foreignKey: 'order_detail_id',
    as: 'reviews'
  });
};

module.exports = OrderDetail;