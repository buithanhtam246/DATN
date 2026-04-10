const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'favorite',
  timestamps: false,
  underscored: true
});

Favorite.associate = (models) => {
  // optional associations
};

module.exports = Favorite;
