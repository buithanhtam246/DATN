const jwtUtil = require('../../Users/utils/jwt.util');

const adminAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng cung cấp token'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    const decoded = jwtUtil.verifyToken(token);

    // Kiểm tra xem user có phải admin không
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể truy cập'
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Admin auth middleware error:', err.message);
    return res.status(401).json({
      success: false,
      message:
        err && err.message === 'invalid signature'
          ? 'Token không hợp lệ (chữ ký sai). Vui lòng đăng nhập lại.'
          : 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
};

// Rate limiting middleware để phòng chống brute force
const loginRateLimit = {};

const adminLoginRateLimiter = (req, res, next) => {
  const email = req.body.email || 'unknown';
  const ip = req.ip || 'unknown';
  const key = `${email}:${ip}`;

  if (!loginRateLimit[key]) {
    loginRateLimit[key] = { attempts: 0, firstAttempt: Date.now() };
  }

  const record = loginRateLimit[key];
  const now = Date.now();
  const timeDiff = now - record.firstAttempt;

  // Reset nếu vượt quá 15 phút
  if (timeDiff > 15 * 60 * 1000) {
    loginRateLimit[key] = { attempts: 0, firstAttempt: now };
  } else if (record.attempts >= 5) {
    // Chỉ cho phép 5 lần thử trong 15 phút
    return res.status(429).json({
      success: false,
      message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.'
    });
  }

  record.attempts++;
  next();
};

module.exports = {
  adminAuthMiddleware,
  adminLoginRateLimiter
};
