const { DataTypes } = require('sequelize');
const {sequelize }= require('../../config/database'); // Đường dẫn tới file cấu hình db của bạn

const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    receiver_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    receiver_phone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    full_address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'addresses',
    timestamps: false // Tự động quản lý created_at và updated_at
});

// associate helper
Address.associate = (models) => {
    Address.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
    });
};

module.exports = Address;