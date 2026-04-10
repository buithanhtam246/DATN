const emailUtil = require('../utils/email.util');
const User = require('../model/user.model');
const Order = require('../model/Order.model');
const { sequelize } = require('../../config/database');

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const formatDateTime = (value) => {
  if (!value) return 'Khong xac dinh';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

const buildItemsHtml = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return '<tr><td colspan="4" style="padding:8px;border:1px solid #ddd;">Khong co chi tiet san pham</td></tr>';
  }

  return items
    .map((item, index) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      const lineTotal = qty * price;
      const variantId = item.variant_id || item.variantId || 'N/A';
      const productName = item.product_name || item.name || `Bien the #${variantId}`;
      const colorName = item.color_name || 'N/A';
      const sizeName = item.size_name || 'N/A';

      return `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${index + 1}</td>
          <td style="padding:8px;border:1px solid #ddd;">
            <div style="font-weight:600;">${productName}</div>
            <div style="font-size:12px;color:#5f6368;margin-top:2px;">Mau: ${colorName} | Size: ${sizeName}</div>
          </td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${qty}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCurrency(lineTotal)}</td>
        </tr>
      `;
    })
    .join('');
};

class OrderEmailService {
  async sendOrderConfirmationEmail({ user, order, items, paymentStatusText = 'Don hang da duoc ghi nhan' }) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return { success: false, skipped: true, reason: 'SMTP config missing' };
    }

    if (!user || !user.email || !order) {
      return { success: false, skipped: true, reason: 'Missing user email or order' };
    }

    const subject = `[GoodShoes] Xác nhận thông tin đơn hàng #${order.id}`;
    const customerName = user.name || user.email;
    const totalPrice = formatCurrency(order.total_price);
    const deliveryCost = formatCurrency(order.delivery_cost);
    const address = order.delivery_address || 'Không có';
    const paymentMethod = order.payment_method || 'Khong xac dinh';
    const orderTime = formatDateTime(order.create_at);

    const html = `
<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#202124;max-width:700px;margin:0 auto;">
        <h2 style="margin:0 0 12px;">Xác nhận đơn hàng</h2>
        <p>Xin Chào <strong>${customerName}</strong>,</p>
        <p>Cảm ơn bạn đã đặt hàng tại GoodShoes. <strong>${paymentStatusText}</strong>.</p>

        <div style="padding:12px;border:1px solid #e0e0e0;border-radius:8px;background:#fafafa;margin:12px 0;">
          <p style="margin:4px 0;"><strong>Mã đơn:</strong> #${order.id}</p>
          <p style="margin:4px 0;"><strong>Tổng thanh toán:</strong> ${totalPrice}</p>
          <p style="margin:4px 0;"><strong>Phí giao hàng:</strong> ${deliveryCost}</p>
          <p style="margin:4px 0;"><strong>Địa chỉ nhận:</strong> ${address}</p>
          <p style="margin:4px 0;"><strong>Trạng thái:</strong> ${order.status}</p>
          <p style="margin:4px 0;"><strong>Phương thức thanh toán:</strong> ${paymentMethod}</p>
          <p style="margin:4px 0;"><strong>Thời gian đặt hàng:</strong> ${orderTime}</p>
        </div>

        <table style="border-collapse:collapse;width:100%;margin-top:12px;">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">#</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Sản phẩm</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:center;">Số lượng</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${buildItemsHtml(items)}
          </tbody>
        </table>

        <p style="margin-top:16px;">Nếu cần hỗ trợ, vui lòng liên hệ bộ phận CSKH.</p>
      </div>
    `;

    await emailUtil.sendMail({
      to: user.email,
      subject,
      html
    });

    return { success: true };
  }

  async sendOrderConfirmationByOrderId(orderId, paymentStatusText) {
    const order = await Order.findByPk(orderId);
    if (!order) return { success: false, skipped: true, reason: 'Order not found' };

    const user = await User.findByPk(order.user_id);
    const details = await sequelize.query(
      `SELECT
         od.order_id,
         od.variant_id,
         od.quantity,
         od.price,
         p.name AS product_name,
         c.name AS color_name,
         s.size AS size_name
       FROM order_details od
       LEFT JOIN variant v ON od.variant_id = v.id
       LEFT JOIN products p ON v.product_id = p.id
       LEFT JOIN color c ON v.color_id = c.id
       LEFT JOIN size s ON v.size_id = s.id
       WHERE od.order_id = ?`,
      {
        replacements: [order.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return this.sendOrderConfirmationEmail({
      user,
      order,
      items: details,
      paymentStatusText
    });
  }
}

module.exports = new OrderEmailService();