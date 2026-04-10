const crypto = require('crypto');
const Order = require('../model/Order.model');
const orderEmailService = require('../service/orderEmail.service');
require('dotenv').config();

const ALLOW_SEND_EMAIL_ON_SANDBOX = process.env.SEND_EMAIL_ON_SANDBOX === 'true';

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

// Detect whether a provider is using a sandbox/test endpoint to avoid sending emails
const isProviderSandbox = (provider) => {
  if (ALLOW_SEND_EMAIL_ON_SANDBOX) return false;
  if (provider === 'VNPay') {
    const vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    return String(vnpUrl).includes('sandbox') || String(vnpUrl).includes('sandbox.vnpayment.vn');
  }
  if (provider === 'MoMo') {
    const momoEndpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
    return String(momoEndpoint).includes('test-payment') || String(momoEndpoint).includes('sandbox');
  }
  return false;
};

const updateOrderPaymentStatus = async (txnRef, responseCode, sendEmail = false, provider = '') => {
  const orderId = parseOrderIdFromTxnRef(txnRef);
  if (!orderId) return null;

  const order = await Order.findByPk(orderId);
  if (!order) return null;

  const previousStatus = order.status;

  // Keep status values compatible with existing order lifecycle
  const nextStatus = responseCode === '00' ? 'confirmed' : 'cancelled';
  await order.update({ status: nextStatus });

  // Only send confirmation email when explicitly requested (e.g., MoMo success)
  if (responseCode === '00' && previousStatus !== 'confirmed' && sendEmail) {
    try {
      const subject = provider === 'MoMo' ? 'Thanh toan MoMo thanh cong' : 'Thanh toan thanh cong';
const emailResult = await orderEmailService.sendOrderConfirmationByOrderId(
        order.id,
        subject
      );

      if (!emailResult?.success) {
        console.warn('Confirmation email not sent:', emailResult?.reason || 'Unknown reason');
      }
    } catch (emailError) {
      console.warn('Confirmation email skipped:', emailError.message);
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
      const sendEmail = responseCode === '00' && !isProviderSandbox('VNPay');
      await updateOrderPaymentStatus(txnRef, responseCode, sendEmail, 'VNPay');
    } catch (e) {
      console.warn('Could not update order status on return:', e.message);
    }

    const frontendReturn = process.env.VNPAY_FRONTEND_RETURN_URL || 'http://localhost:4200/checkout-return';
    const redirectParams = sortObject(params);
    const redirectQuery = buildQueryString(redirectParams);
    return res.redirect(`${frontendReturn}?provider=VNPay&${redirectQuery}`);
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
      const sendEmail = responseCode === '00' && !isProviderSandbox('VNPay');
      await updateOrderPaymentStatus(txnRef, responseCode, sendEmail, 'VNPay');
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


// --- MoMo integration helpers and endpoints ---
// Use environment variables when available:
// MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY, MOMO_ENDPOINT, MOMO_RETURN_URL, MOMO_NOTIFY_URL

const https = require('https');

const buildMomoCreateSignature = ({ partnerCode, accessKey, requestId, amount, orderId, orderInfo, redirectUrl, ipnUrl, extraData, requestType }, secret) => {
const raw = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  return crypto.createHmac('sha256', secret).update(raw).digest('hex');
};

const postJson = (endpoint, body) =>
  new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (!data) return resolve({});
        try {
          return resolve(JSON.parse(data));
        } catch (err) {
          // Return raw body and status to help debugging when non-JSON returned
          return resolve({ parseError: true, raw: data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });

exports.createMomoUrl = async (req, res) => {
  try {
    const { amount, orderId, orderInfo, returnUrl, notifyUrl } = req.body || {};
    const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
    const secretkey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

    const requestId = partnerCode + Date.now();
    // make provided orderId unique to avoid duplicate errors in MoMo sandbox
    const order = orderId ? `${String(orderId)}-${Date.now()}` : requestId;
    const redirectUrl = returnUrl || process.env.MOMO_RETURN_URL || `${req.protocol}://${req.get('host')}/payment/momo_return`;
    const ipnUrl = notifyUrl || process.env.MOMO_NOTIFY_URL || `${req.protocol}://${req.get('host')}/payment/momo_notify`;
    const amountStr = String(Math.round((Number(amount) || 0)));
    const requestType = 'captureWallet';
    const extraData = '';

    const payload = {
      partnerCode,
      accessKey,
      requestId,
      amount: amountStr,
      orderId: order,
      orderInfo: orderInfo || `Thanh toan don hang ${order}`,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType
    };

    const signature = buildMomoCreateSignature(payload, secretkey);
    const requestBody = JSON.stringify({ ...payload, signature, lang: 'en' });

    // Debug logging: print payload/signature/requestBody for troubleshooting
    console.log('--- MoMo create payload ---');
    console.log('endpoint=', endpoint);
    console.log('payload=', payload);
    console.log('signature=', signature);
    console.log('requestBody=', requestBody);
// Try create; implement retry for transient errors (5xx / gateway timeouts)
    const maxCreateAttempts = 3;
    let momoResp;
    for (let attempt = 1; attempt <= maxCreateAttempts; attempt++) {
      try {
        momoResp = await postJson(endpoint, requestBody);
      } catch (err) {
        // network/request error -> treat as transient and retry
        console.warn(`MoMo create attempt ${attempt} failed with network error:`, err.message || err);
        momoResp = { parseError: true, raw: String(err), statusCode: 0 };
      }

      // If response indicates API gateway/server error, wait and retry
      const status = Number(momoResp && momoResp.statusCode) || 0;
      if (momoResp && momoResp.parseError && (status === 0 || status >= 500) && attempt < maxCreateAttempts) {
        const delay = 500 * attempt; // backoff
        console.log(`Transient MoMo error (status=${status}). Retrying in ${delay}ms (attempt ${attempt + 1}/${maxCreateAttempts})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      // otherwise break and process result
      break;
    }
    console.log('--- MoMo response ---');
    console.log('momoResp=', momoResp);
    if (momoResp && momoResp.parseError && momoResp.raw) {
      console.log('momoResp.raw (truncated 2000 chars)=', String(momoResp.raw).slice(0,2000));
    }
    if ((!momoResp || !momoResp.payUrl) && momoResp && Number(momoResp.resultCode) === 41) {
      // retry up to 3 times with modified orderId
      let attempts = 0;
      while (attempts < 3 && (!momoResp || !momoResp.payUrl)) {
        attempts += 1;
        const uniqueOrder = `${order}-${Date.now()}-${Math.floor(Math.random()*9000+1000)}`;
        payload.orderId = uniqueOrder;
        payload.orderInfo = orderInfo || `Thanh toan don hang ${uniqueOrder}`;
        const newRequestId = partnerCode + Date.now();
        payload.requestId = newRequestId;
        const signature2 = buildMomoCreateSignature(payload, secretkey);
        const body2 = JSON.stringify({ ...payload, signature: signature2, lang: 'en' });
        momoResp = await postJson(endpoint, body2);
        if (momoResp && momoResp.payUrl) {
          return res.json({ success: true, url: momoResp.payUrl, momoResponse: momoResp, orderId: payload.orderId });
        }
      }
    }

    if (momoResp && momoResp.payUrl) {
      return res.json({ success: true, url: momoResp.payUrl, momoResponse: momoResp });
    }

    return res.status(500).json({ success: false, message: 'MoMo trả về lỗi', momoResponse: momoResp });
  } catch (err) {
    console.error('createMomoUrl error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo yêu cầu MoMo' });
  }
};

const verifyMomoSignature = (params, secret) => {
  const {
    partnerCode,
    accessKey,
    requestId,
    orderId,
    amount,
    responseTime,
    message,
    resultCode,
    extraData
  } = params;
const raw = `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}&orderId=${orderId}&amount=${amount}&responseTime=${responseTime}&message=${message}&resultCode=${resultCode}&extraData=${extraData || ''}`;
  const hash = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  return { ok: hash === String(params.signature || ''), hash, raw };
};

exports.momoReturn = async (req, res) => {
  try {
    const params = req.query || req.body || {};
    const secretkey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const { ok, hash, raw } = verifyMomoSignature(params, secretkey);
    console.log('MoMo return verify ok=', ok, 'hash=', hash, 'raw=', raw, 'params=', params);

    // MoMo uses resultCode === 0 for success
    const responseCode = params.resultCode == 0 ? '00' : String(params.resultCode);
    const txnRef = params.orderId || params.requestId;

    if (ok) {
      try {
        const sendEmail = responseCode === '00' && !isProviderSandbox('MoMo');
        await updateOrderPaymentStatus(txnRef, responseCode, sendEmail, 'MoMo');
      } catch (e) {
        console.warn('Could not update order status on MoMo return:', e.message);
      }
    } else {
      console.warn('MoMo signature invalid on return');
    }

    const frontendReturn = process.env.MOMO_FRONTEND_RETURN_URL || process.env.VNPAY_FRONTEND_RETURN_URL || 'http://localhost:4200/checkout-return';
    const qp = Object.keys(params || {}).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    const sep = qp ? '&' : '';
    return res.redirect(`${frontendReturn}?provider=MoMo${sep}${qp}`);
  } catch (err) {
    console.error('momoReturn error:', err);
    return res.status(500).send('Server error');
  }
};

exports.momoNotify = async (req, res) => {
  try {
    const params = req.body || req.query || {};
    const secretkey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const { ok, hash, raw } = verifyMomoSignature(params, secretkey);
    console.log('MoMo notify verify ok=', ok, 'hash=', hash, 'raw=', raw, 'params=', params);

    if (!ok) return res.status(400).json({ resultCode: 97, message: 'Invalid signature' });

    const responseCode = params.resultCode == 0 ? '00' : String(params.resultCode);
    const txnRef = params.orderId || params.requestId;

    try {
      const sendEmail = responseCode === '00' && !isProviderSandbox('MoMo');
      await updateOrderPaymentStatus(txnRef, responseCode, sendEmail, 'MoMo');
    } catch (e) {
      console.warn('Could not update order status on MoMo notify:', e.message);
    }

    return res.json({ resultCode: 0, message: 'Confirm Success' });
  } catch (err) {
    console.error('momoNotify error:', err);
    return res.status(500).json({ resultCode: 99, message: 'Server error' });
  }
};

// Server-side redirect helper for debugging: accepts query params and redirects browser to MoMo payUrl
exports.momoRedirect = async (req, res) => {
  try {
    const { amount, orderId, orderInfo } = req.query || {};
    const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
    const secretkey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

    const requestId = partnerCode + Date.now();
    const order = orderId ? `${String(orderId)}-${Date.now()}` : requestId;
    const redirectUrl = process.env.MOMO_RETURN_URL || `${req.protocol}://${req.get('host')}/payment/momo_return`;
    const ipnUrl = process.env.MOMO_NOTIFY_URL || `${req.protocol}://${req.get('host')}/payment/momo_notify`;
    const amountStr = String(Math.round((Number(amount) || 0)));
    const requestType = 'captureWallet';
    const extraData = '';

    const payload = {
      partnerCode,
      accessKey,
      requestId,
      amount: amountStr,
      orderId: order,
      orderInfo: orderInfo || `Thanh toan don hang ${order}`,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType
    };

    const signature = buildMomoCreateSignature(payload, secretkey);
    const body = JSON.stringify({ ...payload, signature, lang: 'en' });

    console.log('[momoRedirect] creating MoMo request for order=', order);
    const momoResp = await postJson(endpoint, body);
    console.log('[momoRedirect] momoResp=', momoResp);

    if (momoResp && momoResp.payUrl) {
      return res.redirect(momoResp.payUrl);
    }

    return res.status(500).send(`MoMo error: ${JSON.stringify(momoResp)}`);
  } catch (err) {
    console.error('momoRedirect error:', err);
    return res.status(500).send('Server error');
  }
};