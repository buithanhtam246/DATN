const Review = require('../model/Review.model');
const OrderDetail = require('../model/OrderDetail.model');
const Order = require('../model/Order.model');
const User = require('../model/user.model');
const { sequelize } = require('../../config/database');

class ReviewRepository {
  // Tạo đánh giá mới
  async createReview(data) {
    return await Review.create(data);
  }

  // Lấy đánh giá theo ID
  async findById(reviewId) {
    return await Review.findByPk(reviewId, {
      include: [
        {
          model: OrderDetail,
          as: 'order_detail',
          attributes: ['id', 'order_id', 'variant_id', 'quantity', 'price']
        }
      ]
    });
  }

  // Lấy đánh giá theo Order Detail ID
  async findByOrderDetailId(orderDetailId) {
    return await Review.findOne({
      where: { order_detail_id: orderDetailId },
      include: [
        {
          model: OrderDetail,
          as: 'order_detail',
          attributes: ['id', 'order_id', 'variant_id', 'quantity', 'price']
        }
      ]
    });
  }

  // Lấy tất cả đánh giá của một sản phẩm (variant)
  async findByVariantId(variantId, limit = 10, offset = 0) {
    return await Review.findAndCountAll({
      attributes: ['id', 'order_detail_id', 'rating', 'comment', 'created_at', 'status'],
      include: [
        {
          model: OrderDetail,
          as: 'order_detail',
          where: { variant_id: variantId },
          attributes: ['id', 'order_id'],
          required: true,
          include: [
            {
              model: Order,
              as: 'order',
              attributes: ['id', 'user_id'],
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        }
      ],
      where: { status: 1 },
      limit,
      offset,
      order: [[sequelize.literal('`order_reviews`.`created_at`'), 'DESC']],
      subQuery: false,
      distinct: true,
      raw: false
    });
  }

  // Lấy tất cả đánh giá của một đơn hàng
  async findByOrderId(orderId) {
    return await Review.findAll({
      include: [
        {
          model: OrderDetail,
          as: 'order_detail',
          where: { order_id: orderId },
          attributes: ['id', 'order_id', 'variant_id']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  // Cập nhật đánh giá
  async updateReview(reviewId, data) {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      throw new Error('Đánh giá không tồn tại');
    }
    return await review.update(data);
  }

  // Xóa đánh giá (soft delete - chỉ đặt status = 0)
  async deleteReview(reviewId) {
    return await this.updateReview(reviewId, { status: 0 });
  }

  // Lấy thống kê đánh giá của một sản phẩm
  async getReviewStats(variantId) {
    const result = await Review.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('order_reviews.id')), 'total_reviews'],
        [sequelize.fn('AVG', sequelize.col('order_reviews.rating')), 'avg_rating'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN order_reviews.rating = 5 THEN 1 ELSE 0 END')), 'count_5star'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN order_reviews.rating = 4 THEN 1 ELSE 0 END')), 'count_4star'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN order_reviews.rating = 3 THEN 1 ELSE 0 END')), 'count_3star'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN order_reviews.rating = 2 THEN 1 ELSE 0 END')), 'count_2star'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN order_reviews.rating = 1 THEN 1 ELSE 0 END')), 'count_1star']
      ],
      include: [
        {
          model: OrderDetail,
          as: 'order_detail',
          where: { variant_id: variantId },
          attributes: [],
          required: true
        }
      ],
      where: { status: 1 },
      raw: true,
      subQuery: false
    });
    return result[0] || null;
  }
}

module.exports = new ReviewRepository();
