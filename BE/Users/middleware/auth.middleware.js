const jwtUtil = require('../utils/jwt.util');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Authorization header:', authHeader);
    
    if (!authHeader) {
      console.log('No authorization header provided');
      return res.status(401).json({ 
        success: false,
        message: 'Vui lòng cung cấp token' 
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.log('Token is empty after split');
      return res.status(401).json({ 
        success: false,
        message: 'Token không hợp lệ' 
      });
    }

    const decoded = jwtUtil.verifyToken(token);
    console.log('Token decoded successfully:', decoded);
    req.user = decoded;

    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    return res.status(401).json({ 
      success: false,
      message:
        err && err.message === 'invalid signature'
          ? 'Token không hợp lệ (chữ ký sai). Vui lòng đăng nhập lại.'
          : 'Token hết hạn hoặc không hợp lệ'
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập tài nguyên này'
    });
  }
  next();
};

// Optional auth: nếu có token thì decode và gắn vào req.user,
// nếu không có token thì vẫn cho đi tiếp (phục vụ guest).
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    const decoded = jwtUtil.verifyToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    // Token sai/hết hạn: coi như guest (không chặn request)
    return next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware
};