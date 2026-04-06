const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Voucher = sequelize.define('vouchers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  code_voucher: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: null
  },
  name_voucher: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: null
  },
  value_reduced: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: null
  },
  promotion_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: null
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  max_value: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: null
  },
  quantity_user: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  minimum_order: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: null
  },
  start_date: {
    type: DataTypes.DATEONLY, // Dùng DATEONLY cho kiểu dữ liệu 'date' trong MySQL
    allowNull: true,
    defaultValue: null
  },
  promotion_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'vouchers', // Tên bảng trong database của bạn
  timestamps: false      // Tắt timestamps tự động
});

module.exports = Voucher;