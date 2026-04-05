const reviewService = require('../service/review.service');
const OrderReview = require('../model/Review.model');
const OrderDetail = require('../model/OrderDetail.model');
const Order = require('../model/Order.model');
const User = require('../model/user.model');
const ProductVariant = require('../model/ProductVariant.model');

class ReviewController {
  // Lấy tất cả reviews (cho admin)
  async getAllReviews(req, res) {
    try {
      const reviews = await OrderReview.findAll({
        include: [
          {
            model: OrderDetail,
            as: 'order_detail',
            attributes: ['id', 'variant_id', 'order_id'],
            include: [
              {
                model: ProductVariant,
                attributes: ['id', 'product_id'],
                as: 'variant'
              },
              {
                model: Order,
                attributes: ['id', 'user_id'],
                as: 'order',
                include: [
                  {
                    model: User,
                    attributes: ['id', 'name'],
                    as: 'user'
                  }
                ]
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        attributes: ['id', 'rating', 'comment', 'created_at', 'status']
      });

      const formattedReviews = reviews.map(review => {
        // Map database status (0/1) to frontend status strings
        let status = 'approved'; // Default: 1 = approved/visible
        if (review.status === 0) {
          status = 'hidden'; // 0 = hidden
        }
        
        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          status: status,
          productId: review.order_detail?.variant?.product_id,
          variantId: review.order_detail?.variant?.id,
          customerName: review.order_detail?.order?.user?.name
        };
      });

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách đánh giá thành công',
        data: formattedReviews
      });
    } catch (err) {
      console.error('getAllReviews error:', err);
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  // Tạo đánh giá
  async create(req, res) {
    try {
      const userId = req.user.id;
      const { order_detail_id, rating, comment } = req.body;

      // Validate input
      if (!order_detail_id) {
        return res.status(400).json({
          success: false,
          message: 'Chi tiết đơn hàng không được để trống'
        });
      }

      const result = await reviewService.createReview(userId, order_detail_id, {
        rating,
        comment
      });

      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }

  // Lấy đánh giá của một sản phẩm
  async getProductReviews(req, res) {
    try {
      const { variant_id, page = 1, limit = 10 } = req.query;

      if (!variant_id) {
        return res.status(400).json({
          success: false,
          message: 'Variant ID không được để trống'
        });
      }

      const result = await reviewService.getProductReviews(variant_id, parseInt(page), parseInt(limit));
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  // Lấy đánh giá của một đơn hàng
  async getOrderReviews(req, res) {
    try {
      const userId = req.user.id;
      const { order_id } = req.params;

      const result = await reviewService.getOrderReviews(userId, parseInt(order_id));
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }

  // Cập nhật đánh giá
  async update(req, res) {
    try {
      const userId = req.user.id;
      const { review_id } = req.params;
      const { rating, comment } = req.body;

      const result = await reviewService.updateReview(userId, review_id, {
        rating,
        comment
      });

      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }

  // Xóa đánh giá
  async delete(req, res) {
    try {
      const userId = req.user.id;
      const { review_id } = req.params;

      const result = await reviewService.deleteReview(userId, review_id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }

  // Cập nhật trạng thái hiển thị/ẩn đánh giá (Admin only)
  async updateStatus(req, res) {
    try {
      const { review_id } = req.params;
      const { status } = req.body;

      if (status === undefined || status === null) {
        return res.status(400).json({
          success: false,
          message: 'Status không được để trống'
        });
      }

      const review = await OrderReview.findByPk(review_id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đánh giá'
        });
      }

      await review.update({ status });

      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái đánh giá thành công',
        data: review
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new ReviewController();
