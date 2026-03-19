const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Theo ảnh DB: Null = Có
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 1 // Theo ảnh DB: Mặc định = 1
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'cart',
    timestamps: true,      // Kích hoạt vì ảnh có created_at/updated_at
    underscored: true,     // Tự động hiểu user_id thay vì userId
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Cart.associate = (models) => {
    Cart.hasMany(models.CartItem, { foreignKey: 'cart_id', as: 'items' });
};

module.exports = Cart;