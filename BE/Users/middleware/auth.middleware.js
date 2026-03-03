const jwtUtil = require('../utils/jwt.util');

const authMiddleware = (req, res, next) => {
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
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      message: 'Token hết hạn hoặc không hợp lệ' 
    });
  }
};

module.exports = authMiddleware;