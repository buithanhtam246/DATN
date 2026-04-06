const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Variant = sequelize.define("variant", {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        product_id: { type: DataTypes.INTEGER, allowNull: false },
        color_id: { type: DataTypes.INTEGER, allowNull: true },
        size_id: { type: DataTypes.INTEGER, allowNull: true },
        price: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.00 },
        price_sale: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.00 },
        quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
        image: { type: DataTypes.TEXT, allowNull: true }
    }, {
        tableName: 'variant',
        timestamps: false
    });
    return Variant;
};