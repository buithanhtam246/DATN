const orderRepository = require('../repository/Order.repository');
const voucherService = require('./voucher.service');
const voucherRepository = require('../repository/voucher.repository');
const { sequelize } = require('../../config/database');

class OrderService {
  async checkout(userId, orderData) {
    // orderData bao gồm: address_id, payment_method_id, voucher_code, note, delivery, items[], delivery_cost
    const { items, voucher_code, address_id, delivery_cost = 30000, ...orderInfo } = orderData;

    return await sequelize.transaction(async (t) => {
      // 1. Tính tổng tiền từ danh sách sản phẩm gửi lên
      let subtotal = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      // 2. Validate và áp dụng voucher nếu có
      let discount_amount = 0;
      let voucher_id = null;

      if (voucher_code) {
        console.log('[DEBUG Order] Applying voucher:', voucher_code, 'total:', subtotal);
        const voucherResult = await voucherService.validateAndCalculateDiscount(
          voucher_code,
          subtotal
        );

        console.log('[DEBUG Order] Voucher result:', voucherResult);

        if (!voucherResult.valid) {
          throw new Error(voucherResult.message);
        }

        discount_amount = parseFloat(voucherResult.discountAmount) || 0;
        voucher_id = voucherResult.voucher.id;

        console.log('[DEBUG Order] After discount:', { discount_amount });

        // Giảm số lượng voucher
        await voucherRepository.decrementQuantity(voucher_id);
      }

      // 3. Tính tổng cuối cùng (subtotal - discount + delivery_cost)
      const final_delivery_cost = parseFloat(delivery_cost) || 30000;
      const total_price = subtotal - discount_amount + final_delivery_cost;

      // 4. Tạo đơn hàng chính
      const order = await orderRepository.createOrder({
        user_id: userId,
        address_id: address_id || null,
        total_price: total_price,
        delivery_cost: final_delivery_cost,
        status: 'pending',
        voucher_id: voucher_id || null,
        ...orderInfo,
        create_at: new Date()
      }, t);

      // 5. Chuẩn bị dữ liệu cho bảng chi tiết đơn hàng
      const detailsData = items.map(item => ({
        order_id: order.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price
      }));

      // 6. Lưu vào bảng order_details
      await orderRepository.createOrderDetails(detailsData, t);

      return {
        ...order.toJSON(),
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount_amount: parseFloat(discount_amount.toFixed(2)),
        delivery_cost: parseFloat(final_delivery_cost.toFixed(2)),
        total_price: parseFloat(total_price.toFixed(2))
      };
    });
  }

  // Lấy chi tiết đơn hàng
  async getOrderDetails(orderId, userId) {
    const order = await orderRepository.getOrderByIdWithDetails(orderId);

    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }

    // Kiểm tra quyền sở hữu
    if (order.user_id !== userId) {
      throw new Error('Bạn không có quyền xem đơn hàng này');
    }

    return order;
  }

  // Thay đổi trạng thái đơn hàng (chỉ admin hoặc chủ đơn mới được)
  async changeStatus(orderId, user, newStatus) {
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(newStatus)) {
      throw new Error('Trạng thái không hợp lệ');
    }

    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }

    // authorization: admin (role === 'admin') hoặc chủ đơn hàng
    if (order.user_id !== user.id && !(user && user.role === 'admin')) {
      throw new Error('Bạn không có quyền cập nhật trạng thái đơn hàng');
    }

    // business rules: có thể thêm kiểm tra chuyển trạng thái hợp lệ nếu cần
    const updated = await orderRepository.updateStatus(orderId, newStatus);
    return updated;
  }
}

module.exports = new OrderService();