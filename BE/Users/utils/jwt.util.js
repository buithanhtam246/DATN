const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', '..', '.env'),
  override: true
});

const jwt = require('jsonwebtoken');

module.exports = {
  /**
   * Tạo JWT token.
   * @param {object} payload - dữ liệu muốn lưu trong token
   * @param {string} [expiresIn='1d'] - thời hạn (vd: '1h', '7d')
   */
  generateToken: (payload, expiresIn = '1d') => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  },

  verifyToken: (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
};