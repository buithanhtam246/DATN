const sequelize = require('../../config/database');
const { DataTypes } = require('sequelize');

const User = sequelize.sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  password: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },

  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  role: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: true,
    defaultValue: 'user'
  }

}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;