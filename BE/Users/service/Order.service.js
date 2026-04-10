const orderRepository = require('../repository/Order.repository');
const voucherService = require('./voucher.service');
const voucherRepository = require('../repository/voucher.repository');
const orderEmailService = require('./orderEmail.service');
const { sequelize } = require('../../config/database');

class OrderService {
  async checkout(userId, orderData) {
    // orderData bao gồm: address_id, delivery_address, payment_method_id, voucher_code, note, delivery, items[], delivery_cost
    const { items, voucher_code, address_id, delivery_address, delivery_cost = 30000, ...orderInfo } = orderData;
    // Basic validation: items must be a non-empty array
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Danh sách sản phẩm đặt hàng không được rỗng');
    }

    // Defensive logging for easier debugging
    try {
      console.log('[OrderService.checkout] userId=', userId, 'itemsCount=', (items || []).length);
    } catch (e) {
      // ignore
    }

    const createdOrder = await sequelize.transaction(async (t) => {
      const variantIds = (items || [])
        .map(item => Number(item.variant_id))
        .filter(variantId => Number.isFinite(variantId) && variantId > 0);

      if (variantIds.length === 0) {
        throw new Error('Không tìm thấy variant_id hợp lệ trong danh sách sản phẩm');
      }

      const placeholders = variantIds.map(() => '?').join(', ');
      const variantsInStock = await sequelize.query(
        `SELECT id, quantity
         FROM variant
         WHERE id IN (${placeholders})
         FOR UPDATE`,
        {
          replacements: variantIds,
          type: sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      // Ensure all requested variant ids exist
      const foundIds = variantsInStock.map(v => Number(v.id));
      const missing = variantIds.filter(id => !foundIds.includes(id));
      if (missing.length > 0) {
        throw new Error(`Một hoặc nhiều biến thể không tồn tại: ${missing.join(', ')}`);
      }

      const stockByVariantId = variantsInStock.reduce((acc, variant) => {
        acc[Number(variant.id)] = Number(variant.quantity || 0);
        return acc;
      }, {});

      for (const item of items) {
        const variantId = Number(item.variant_id);
        const requestQty = Number(item.quantity || 0);

        if (!Number.isFinite(variantId) || variantId <= 0) {
          throw new Error('Biến thể sản phẩm không hợp lệ');
        }

        if (!Number.isFinite(requestQty) || requestQty <= 0) {
          throw new Error('Số lượng sản phẩm không hợp lệ');
        }

        const availableQty = stockByVariantId[variantId];
        if (availableQty === undefined) {
          throw new Error(`Biến thể #${variantId} không tồn tại`);
        }

        if (availableQty < requestQty) {
          throw new Error(`Số lượng không đủ cho biến thể #${variantId}. Tồn kho: ${availableQty}, yêu cầu: ${requestQty}`);
        }

        stockByVariantId[variantId] = availableQty - requestQty;
      }

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
        delivery_address: delivery_address || null,
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

      // 7. Trừ tồn kho sau khi tạo đơn hàng thành công
      for (const item of items) {
        await sequelize.query(
          `UPDATE variant
           SET quantity = quantity - ?
           WHERE id = ?`,
          {
            replacements: [item.quantity, item.variant_id],
            type: sequelize.QueryTypes.UPDATE,
            transaction: t
          }
        );
      }

      return {
        ...order.toJSON(),
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount_amount: parseFloat(discount_amount.toFixed(2)),
        delivery_cost: parseFloat(final_delivery_cost.toFixed(2)),
        total_price: parseFloat(total_price.toFixed(2))
      };
    });

    // Send confirmation email for non-VNPay flows after order commit.
    // VNPay orders are confirmed by payment callback and emailed there.
    try {
      const paymentMethod = String(orderData.payment_method || '').toLowerCase();
      const isVnpay = paymentMethod.includes('vnpay');
      const isMomo = paymentMethod.includes('momo');
      const skipEmailFlag = Boolean(orderData.skipEmail);

      // Do NOT send confirmation email immediately for third-party online payments
      // (VNPay, MoMo), or when frontend explicitly asks to skip immediate email
      // (via orderData.skipEmail). For those methods we'll send confirmation when
      // the payment provider notifies our backend (in their return/notify handlers).
if (!isVnpay && !isMomo && !skipEmailFlag) {
        const emailResult = await orderEmailService.sendOrderConfirmationByOrderId(
          createdOrder.id,
          'Don hang cua ban da dat thanh cong'
        );

        if (!emailResult?.success) {
          console.warn('Order confirmation email not sent:', emailResult?.reason || 'Unknown reason');
        }
      }
    } catch (emailError) {
      console.warn('Order confirmation email skipped:', emailError.message);
    }

    return createdOrder;
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
