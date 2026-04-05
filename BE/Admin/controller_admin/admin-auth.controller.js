const { sequelize } = require('../../config/database');
const User = require('../../Users/model/user.model');
const bcryptUtil = require('../../Users/utils/bcrypt.util');
const jwtUtil = require('../../Users/utils/jwt.util');

class AdminAuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email và mật khẩu không được để trống'
        });
      }

      // Query database để tìm user với role = 'admin'
      const user = await User.findOne({
        where: { email, role: 'admin' }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email admin không tồn tại hoặc không có quyền admin'
        });
      }

      // Kiểm tra mật khẩu
      const isMatch = await bcryptUtil.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Sai mật khẩu'
        });
      }

      // Tạo JWT token với thời gian hết hạn ngắn hơn (2 giờ)
      const token = jwtUtil.generateToken(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        '2h'
      );

      return res.json({
        success: true,
        message: 'Đăng nhập admin thành công',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (err) {
      console.error('Admin login error:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + err.message
      });
    }
  }

  async verify(req, res) {
    try {
      // Token đã được verify bởi middleware
      const user = req.user;
      
      return res.json({
        success: true,
        message: 'Token hợp lệ',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
  }

  async logout(req, res) {
    try {
      // Token đã được verify bởi middleware
      const user = req.user;

      // Lưu log đăng xuất admin (optional)
      const timestamp = new Date();
      await pool.query(
        `INSERT INTO admin_logout_logs (admin_id, email, ip_address, created_at) VALUES (?, ?, ?, ?)`,
        [user.id, user.email, req.ip || 'unknown', timestamp]
      ).catch(() => {
        // Bỏ qua nếu table không tồn tại
      });

      return res.json({
        success: true,
        message: 'Đăng xuất admin thành công'
      });
    } catch (err) {
      console.error('Admin logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + err.message
      });
    }
  }
}

module.exports = new AdminAuthController();
