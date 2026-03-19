const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database'); // Đảm bảo đường dẫn này đúng với dự án của bạn

const OrderReview = sequelize.define('order_reviews', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_detail_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Khớp với cột "Có" Null trong ảnh của bạn
    references: {
      model: 'order_details',
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1 // 1 có thể là hiển thị, 0 là ẩn
  }
}, {
  tableName: 'order_reviews', // Tên bảng chính xác trong database của bạn
  timestamps: false           // Tắt timestamps tự động vì bạn đã có created_at
});

// Association
OrderReview.associate = (models) => {
  OrderReview.belongsTo(models.OrderDetail, {
    foreignKey: 'order_detail_id',
    as: 'order_detail'
  });
};

module.exports = OrderReview;