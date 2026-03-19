const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Order = sequelize.sequelize.define('orders', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  address_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  total_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  delivery_cost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending' // pending, confirmed, shipped, delivered, cancelled
  },
  payment_method_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  voucher_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  delivery: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  create_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'orders',
  timestamps: false,
  constraints: false  // Bỏ Foreign Key constraint để tránh lỗi
});

// Association
Order.associate = (models) => {
  Order.hasMany(models.OrderDetail, {
    foreignKey: 'order_id',
    as: 'orderDetails'
  });
};

module.exports = Order;