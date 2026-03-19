const reviewService = require('../service/review.service');

class ReviewController {
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
}

module.exports = new ReviewController();
