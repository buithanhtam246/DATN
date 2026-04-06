const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    cart_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Theo ảnh DB: Null = Có
    },
    variant_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Theo ảnh DB: Null = Có
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: true // Theo ảnh DB: Null = Có
    }
}, {
    tableName: 'cart_item',
    timestamps: false // Theo ảnh DB: Bảng này không có cột thời gian
});

CartItem.associate = (models) => {
    CartItem.belongsTo(models.Cart, { foreignKey: 'cart_id', as: 'cart' });
};

module.exports = CartItem;