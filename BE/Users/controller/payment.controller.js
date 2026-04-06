const crypto = require('crypto');
const Order = require('../model/Order.model');
const orderEmailService = require('../service/orderEmail.service');
require('dotenv').config();

// VNPay requires sorted and URL-encoded params, with spaces encoded as '+'
const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj)
    .filter((key) => obj[key] !== undefined && obj[key] !== null && obj[key] !== '')
    .map((key) => encodeURIComponent(key))
    .sort();

  for (const encodedKey of keys) {
    const key = decodeURIComponent(encodedKey);
    sorted[encodedKey] = encodeURIComponent(String(obj[key])).replace(/%20/g, '+');
  }

  return sorted;
};

const buildQueryString = (params) =>
  Object.keys(params)
    .map((k) => `${k}=${params[k]}`)
    .join('&');

const getClientIp = (req) => {
  const xff = req.headers['x-forwarded-for'];
  const raw = (Array.isArray(xff) ? xff[0] : xff) || req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || '127.0.0.1';
  if (raw === '::1') return '127.0.0.1';
  if (raw && raw.includes('::ffff:')) return raw.split('::ffff:')[1];
  return raw;
};

const parseOrderIdFromTxnRef = (txnRef) => {
  if (!txnRef) return null;
  const direct = Number(txnRef);
  if (Number.isInteger(direct) && direct > 0) return direct;

  const match = String(txnRef).match(/(\d+)/);
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const updateOrderPaymentStatus = async (txnRef, responseCode) => {
  const orderId = parseOrderIdFromTxnRef(txnRef);
  if (!orderId) return null;

  const order = await Order.findByPk(orderId);
  if (!order) return null;

  const previousStatus = order.status;

  // Keep status values compatible with existing order lifecycle
  const nextStatus = responseCode === '00' ? 'confirmed' : 'cancelled';
  await order.update({ status: nextStatus });

  if (responseCode === '00' && previousStatus !== 'confirmed') {
    try {
      const emailResult = await orderEmailService.sendOrderConfirmationByOrderId(
        order.id,
        'Thanh toan VNPay thanh cong'
      );

      if (!emailResult?.success) {
        console.warn('VNPay confirmation email not sent:', emailResult?.reason || 'Unknown reason');
      }
    } catch (emailError) {
      console.warn('VNPay confirmation email skipped:', emailError.message);
    }
  }

  return order;
};

// Build VNPay payment URL
exports.createVnpayUrl = (req, res) => {
  try {
    const { amount, orderId, orderInfo, bankCode } = req.body;
    const tmnCode = process.env.VNPAY_TMN_CODE || 'VNPAYTMNCODE';
    const secret = process.env.VNPAY_HASH_SECRET || 'VNPAYHASHSECRET';
    const vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = process.env.VNPAY_RETURN_URL || `${req.protocol}://${req.get('host')}/payment/vnpay_return`;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Thiếu mã đơn hàng để tạo giao dịch VNPay' });
    }

    // createDate must be local time in format YYYYMMDDHHmmss
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const createDate = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    const order = String(orderId);

    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: order,
      vnp_OrderInfo: orderInfo || `Thanh toan don hang ${order}`,
      // Use a common order type; adjust if your VNPay account expects a different value
      vnp_OrderType: 'billpayment',
      vnp_Amount: String(Math.round((Number(amount) || 0) * 100)),
      vnp_ReturnUrl: returnUrl,
      vnp_CreateDate: createDate,
      // client IP should be plain ipv4/ipv6 text
      vnp_IpAddr: getClientIp(req)
    };

    if (bankCode) vnpParams.vnp_BankCode = bankCode;

    // Use VNPay canonical format for both query and signed data
    const sorted = sortObject(vnpParams);
    const query = buildQueryString(sorted);
    const signData = query;
    const hmac = crypto.createHmac('sha512', secret).update(signData).digest('hex');
    const paymentUrl = `${vnpUrl}?${query}&vnp_SecureHash=${hmac}`;

    console.log('VNPay params:', sorted);
    console.log('VNPay secure hash:', hmac);
    console.log('VNPay paymentUrl:', paymentUrl);

    return res.json({ success: true, url: paymentUrl });
  } catch (err) {
    console.error('Error createVnpayUrl:', err);
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo URL VNPay' });
  }
};

// Placeholder return and ipn handlers
// Helper to verify VNPay secure hash
const verifyVnpayHash = (query, secret) => {
  const vnp_SecureHash = query.vnp_SecureHash || query.vnp_SecureHash1 || '';
  // copy params and remove secure hash fields
  const data = Object.assign({}, query);
  delete data.vnp_SecureHash;
  delete data.vnp_SecureHashType;
  delete data.vnp_SecureHash1;

  const sorted = sortObject(data);
  const signData = buildQueryString(sorted);
  const hash = crypto.createHmac('sha512', secret).update(signData).digest('hex');
  return { ok: hash.toLowerCase() === String(vnp_SecureHash).toLowerCase(), hash, signData };
};

exports.vnpayReturn = async (req, res) => {
  try {
    const params = req.query || {};
    const secret = process.env.VNPAY_HASH_SECRET || 'VNPAYHASHSECRET';
    const { ok, hash } = verifyVnpayHash(params, secret);
    console.log('VNPay return verify ok=', ok, 'hash=', hash, 'params=', params);

    // vnp_ResponseCode === '00' indicates success
    const responseCode = params.vnp_ResponseCode;
    const txnRef = params.vnp_TxnRef;

    if (!ok) return res.status(400).send('Invalid secure hash');

    try {
      await updateOrderPaymentStatus(txnRef, responseCode);
    } catch (e) {
      console.warn('Could not update order status on return:', e.message);
    }

    const frontendReturn = process.env.VNPAY_FRONTEND_RETURN_URL || 'http://localhost:4200/checkout-return';
    const redirectParams = sortObject(params);
    const redirectQuery = buildQueryString(redirectParams);
    return res.redirect(`${frontendReturn}?${redirectQuery}`);
  } catch (err) {
    console.error('vnpayReturn error:', err);
    return res.status(500).send('Server error');
  }
};

exports.vnpayIpn = async (req, res) => {
  try {
    const params = req.body || req.query || {};
    const secret = process.env.VNPAY_HASH_SECRET || 'VNPAYHASHSECRET';
    const { ok } = verifyVnpayHash(params, secret);
    console.log('VNPay IPN verify ok=', ok, 'params=', params);

    if (!ok) return res.status(400).json({ RspCode: 97, Message: 'Invalid signature' });

    const responseCode = params.vnp_ResponseCode;
    const txnRef = params.vnp_TxnRef;

    try {
      await updateOrderPaymentStatus(txnRef, responseCode);
    } catch (e) {
      console.warn('Could not update order status on IPN:', e.message);
    }

    // VNPay expects JSON body with RspCode 00 for success
    return res.json({ RspCode: '00', Message: 'Confirm Success' });
  } catch (err) {
    console.error('vnpayIpn error:', err);
    return res.status(500).json({ RspCode: 99, Message: 'Server error' });
  }
};
