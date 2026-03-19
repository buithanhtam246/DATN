const reviewRepository = require('../repository/review.repository');
const Order = require('../model/Order.model');
const OrderDetail = require('../model/OrderDetail.model');

class ReviewService {
  // Tạo đánh giá mới
  async createReview(userId, orderDetailId, reviewData) {
    // Validate order detail exists và belongs to user
    const orderDetail = await OrderDetail.findByPk(orderDetailId, {
      include: [
        {
          model: Order,
          attributes: ['id', 'user_id', 'status'],
          as: 'order'
        }
      ]
    });

    if (!orderDetail) {
      throw new Error('Chi tiết đơn hàng không tồn tại');
    }

    if (orderDetail.order.user_id !== userId) {
      throw new Error('Bạn không có quyền đánh giá sản phẩm này');
    }

    // Kiểm tra đơn hàng đã được giao chưa
    if (orderDetail.order.status !== 'delivered') {
      throw new Error('Chỉ có thể đánh giá sản phẩm từ đơn hàng đã giao');
    }

    // Kiểm tra đã đánh giá chưa
    const existingReview = await reviewRepository.findByOrderDetailId(orderDetailId);
    if (existingReview) {
      throw new Error('Bạn đã đánh giá sản phẩm này rồi');
    }

    // Validate rating (1-5)
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Đánh giá phải từ 1 đến 5 sao');
    }

    // Validate comment
    if (!reviewData.comment || reviewData.comment.trim().length === 0) {
      throw new Error('Vui lòng nhập nhận xét');
    }

    if (reviewData.comment.length > 1000) {
      throw new Error('Nhận xét không được vượt quá 1000 ký tự');
    }

    // Tạo đánh giá
    const review = await reviewRepository.createReview({
      order_detail_id: orderDetailId,
      rating: Math.round(reviewData.rating),
      comment: reviewData.comment.trim(),
      status: 1
    });

    return {
      success: true,
      message: 'Đánh giá thành công!',
      data: review
    };
  }

  // Lấy đánh giá của một sản phẩm
  async getProductReviews(variantId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const { rows, count } = await reviewRepository.findByVariantId(variantId, limit, offset);

    const stats = await reviewRepository.getReviewStats(variantId);

    return {
      success: true,
      data: {
        reviews: rows,
        pagination: {
          current_page: page,
          limit,
          total: count,
          total_pages: Math.ceil(count / limit)
        },
        stats: {
          total_reviews: stats?.total_reviews || 0,
          avg_rating: parseFloat(stats?.avg_rating || 0).toFixed(1),
          rating_distribution: {
            '5_star': stats?.count_5star || 0,
            '4_star': stats?.count_4star || 0,
            '3_star': stats?.count_3star || 0,
            '2_star': stats?.count_2star || 0,
            '1_star': stats?.count_1star || 0
          }
        }
      }
    };
  }

  // Lấy đánh giá của một đơn hàng
  async getOrderReviews(userId, orderId) {
    // Verify order belongs to user
    const order = await Order.findByPk(orderId);
    if (!order || order.user_id !== userId) {
      throw new Error('Đơn hàng không tồn tại');
    }

    const reviews = await reviewRepository.findByOrderId(orderId);

    return {
      success: true,
      data: reviews
    };
  }

  // Cập nhật đánh giá
  async updateReview(userId, reviewId, reviewData) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Đánh giá không tồn tại');
    }

    // Verify ownership
    const orderDetail = await OrderDetail.findByPk(review.order_detail_id, {
      include: [{ model: Order, attributes: ['user_id'], as: 'order' }]
    });

    if (orderDetail.order.user_id !== userId) {
      throw new Error('Bạn không có quyền chỉnh sửa đánh giá này');
    }

    // Validate data
    if (reviewData.rating && (reviewData.rating < 1 || reviewData.rating > 5)) {
      throw new Error('Đánh giá phải từ 1 đến 5 sao');
    }

    if (reviewData.comment && reviewData.comment.length > 1000) {
      throw new Error('Nhận xét không được vượt quá 1000 ký tự');
    }

    const updateData = {};
    if (reviewData.rating) updateData.rating = Math.round(reviewData.rating);
    if (reviewData.comment) updateData.comment = reviewData.comment.trim();

    const updatedReview = await reviewRepository.updateReview(reviewId, updateData);

    return {
      success: true,
      message: 'Cập nhật đánh giá thành công!',
      data: updatedReview
    };
  }

  // Xóa đánh giá
  async deleteReview(userId, reviewId) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Đánh giá không tồn tại');
    }

    // Verify ownership
    const orderDetail = await OrderDetail.findByPk(review.order_detail_id, {
      include: [{ model: Order, attributes: ['user_id'], as: 'order' }]
    });

    if (orderDetail.order.user_id !== userId) {
      throw new Error('Bạn không có quyền xóa đánh giá này');
    }

    await reviewRepository.deleteReview(reviewId);

    return {
      success: true,
      message: 'Xóa đánh giá thành công!'
    };
  }
}

module.exports = new ReviewService();
