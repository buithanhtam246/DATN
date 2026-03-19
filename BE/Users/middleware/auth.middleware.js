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
      message: 'Token hết hạn hoặc không hợp lệ' 
    });
  }
};

module.exports = authMiddleware;