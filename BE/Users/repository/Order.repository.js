const Order = require('../model/Order.model');
const OrderDetail = require('../model/OrderDetail.model');
const Address = require('../model/address.model');
const PaymentMethod = require('../model/PaymentMethod.model');
const Voucher = require('../model/Voucher.model');
const ProductVariant = require('../model/ProductVariant.model');

class OrderRepository {
  // Tạo đơn hàng tổng
  async createOrder(data, transaction) {
    return await Order.create(data, { transaction });
  }

  // Tạo nhiều chi tiết đơn hàng cùng lúc
  async createOrderDetails(details, transaction) {
    return await OrderDetail.bulkCreate(details, { transaction });
  }

  // Tìm đơn hàng theo ID (để xem lại)
  async findById(orderId) {
    return await Order.findByPk(orderId, {
      include: ['details'] // Cần cấu hình Association để dùng được cái này
    });
  }

  // Lấy chi tiết đơn hàng với thông tin đầy đủ
  async getOrderByIdWithDetails(orderId) {
    return await Order.findByPk(orderId, {
      include: [
        {
          model: OrderDetail,
          as: 'details',
          include: [{
            model: ProductVariant,
            as: 'variant'
          }]
        },
        {
          model: Address,
          as: 'address'
        },
        {
          model: PaymentMethod,
          as: 'paymentMethod'
        },
        {
          model: Voucher,
          as: 'voucher'
        }
      ]
    });
  }

  // Cập nhật trạng thái đơn hàng
  async updateStatus(orderId, status) {
    const order = await Order.findByPk(orderId);
    if (!order) return null;
    order.status = status;
    await order.save();
    return order;
  }
}

module.exports = new OrderRepository();