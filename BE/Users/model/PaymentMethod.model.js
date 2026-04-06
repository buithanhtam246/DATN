const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PaymentMethod = sequelize.define('payment_methods', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true, // Trong ảnh của bạn cột này cho phép NULL
    defaultValue: null
  }
}, {
  tableName: 'payment_methods', // Tên bảng chính xác trong database
  timestamps: false             // Tắt timestamps vì bảng của bạn không có createdAt/updatedAt
});

module.exports = PaymentMethod;