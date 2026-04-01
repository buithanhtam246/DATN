const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Product = sequelize.define("products", {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        category_id: { type: DataTypes.INTEGER, allowNull: true },
        brand_id: { type: DataTypes.INTEGER, allowNull: true },
        name: { type: DataTypes.STRING(200), allowNull: true },
        image: { type: DataTypes.TEXT, allowNull: true },
        describ: { type: DataTypes.TEXT, allowNull: true },
        date_add: { 
            type: DataTypes.DATE, 
            allowNull: true,
            defaultValue: DataTypes.NOW 
        }
    }, {
        tableName: 'products',
        timestamps: false
    });
    return Product;
};