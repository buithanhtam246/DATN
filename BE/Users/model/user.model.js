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

  role: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: true,
    defaultValue: 'user'
  },

  otp: {
    type: DataTypes.STRING(10),
    allowNull: true
  },

  otp_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM('active', 'blocked'),
    allowNull: true,
    defaultValue: 'active'
  }
  

}, {
  tableName: 'users',
  timestamps: false
});

// ----- associations helper -----
// Sequelize doesn't automatically wire associations when models are
// defined in separate files.  We'll export a helper that the application
// can call after all models have been imported (see server.js).

User.associate = (models) => {
  // a user can have many addresses (address book)
  User.hasMany(models.Address, {
    foreignKey: 'user_id',
    as: 'addresses',
    onDelete: 'CASCADE',
    hooks: true
  });
  User.hasMany(models.Order, {
    foreignKey: 'user_id',
    as: 'orders'
  });
};

module.exports = User;