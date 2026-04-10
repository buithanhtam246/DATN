const authService = require('../service/auth.service');

class AuthController {
  async register(req, res) {
    try {
      const user = await authService.register(req.body);
      return res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: user
      });
    } catch (err) {
      return res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }
  }

  async registerAdmin(req, res) {
    try {
      const user = await authService.registerAdmin(req.body);
      return res.status(201).json({
        success: true,
        message: 'Đăng ký admin thành công',
        data: user
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }

  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      return res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result
      });
    } catch (err) {
      return res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }
  }

  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email và mật khẩu không được để trống'
        });
      }

      // Kiểm tra user có role = 'admin'
      const result = await authService.login({ email, password });
      
      if (!result.user || result.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản này không có quyền admin'
        });
      }

      return res.json({
        success: true,
        message: 'Đăng nhập admin thành công',
        data: result
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }

  async googleLogin(req, res) {
    try {
      const idToken = req.body?.id_token || req.body?.idToken;
      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu id_token'
        });
      }

      const result = await authService.googleLogin(idToken);
      return res.json({
        success: true,
        message: 'Đăng nhập Google thành công',
        data: result
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      console.log('forgotPassword called with', req.body);
      const { email } = req.body;
      await authService.forgotPassword(email);
      // luôn trả về success để không tiết lộ email
      return res.json({ success: true, message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn qua mail' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async forgotPasswordToken(req, res) {
    try {
      console.log('forgotPasswordToken called with', req.body);
      const { email } = req.body;
      await authService.forgotPasswordToken(email);
      return res.json({ success: true, message: 'Nếu email tồn tại, liên kết đặt lại sẽ được gửi' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
async resetPassword(req, res) {
    try {
      const { token, password, confirmPassword } = req.body;
      if (!token || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'Thiếu token hoặc mật khẩu' });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không trùng' });
      }
      await authService.resetPassword(token, password);
      return res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async requestResetCode(req, res) {
    try {
      console.log('requestResetCode called with', req.body);
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email' });
      await authService.forgotPassword(email);
      return res.json({ success: true, message: 'Nếu email tồn tại, mã đặt lại sẽ được gửi' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async resetWithCode(req, res) {
    try {
      const { email, code, password, confirmPassword } = req.body;
      if (!email || !code || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'Thiếu tham số' });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không trùng' });
      }
      await authService.resetPasswordWithCode(email, code, password);
      return res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async verifyResetCode(req, res) {
    try {
      const { email, code } = req.body;
      if (!email || !code) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và code' });
      const isValid = await authService.verifyResetCode(email, code);
      if (isValid) {
        return res.json({ success: true, message: 'Code hợp lệ' });
      } else {
        return res.status(400).json({ success: false, message: 'Code không hợp lệ' });
      }
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // tiện ích: gửi mail thử nghiệm
  async testEmail(req, res) {
    try {
      const emailUtil = require('../utils/email.util');
      const { to } = req.body;
      if (!to) return res.status(400).json({ success: false, message: 'Thiếu địa chỉ nhận' });
      const info = await emailUtil.sendMail({
        to,
        subject: 'Mail thử nghiệm từ hệ thống',
        text: 'Nếu bạn nhận được thư này, cấu hình SMTP đã hoạt động.',
html: '<p>Nếu bạn nhận được thư này, cấu hình SMTP đã hoạt động.</p>'
      });
      return res.json({ success: true, message: 'Mail đã gửi', info });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user.id; // từ auth middleware

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không trùng' });
      }

      await authService.changePassword(userId, currentPassword, newPassword);
      return res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async adminLogout(req, res) {
    try {
      // Token đã được verify bởi middleware
      const user = req.user;

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

module.exports = new AuthController();