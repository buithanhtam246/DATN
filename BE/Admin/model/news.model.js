const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const News = sequelize.define("news", {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING(255), allowNull: false },
        slug: { type: DataTypes.STRING(255), allowNull: false },
        summary: { type: DataTypes.TEXT, allowNull: true },
        content: { type: DataTypes.TEXT('long'), allowNull: true },
        image_url: { type: DataTypes.STRING(1000), allowNull: true },
        status: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 1 },
        is_featured: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 0 },
        author_name: { type: DataTypes.STRING(150), allowNull: true },
        published_at: { type: DataTypes.DATE, allowNull: true }
    }, {
        tableName: 'news',
        timestamps: true,
        underscored: true
    });

    return News;
};
