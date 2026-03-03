const userRepository = require('../repository/user.repository');
const bcryptUtil = require('../utils/bcrypt.util');
const jwtUtil = require('../utils/jwt.util');
const passwordResetRepo = require('../repository/passwordReset.repository');
const emailUtil = require('../utils/email.util');
const { Op } = require('sequelize');

class AuthService {
  async register(data) {
    const { fullname, email, password } = data;

    // Kiểm tra email đã tồn tại
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error('Email đã tồn tại');

    // Mã hóa mật khẩu
    const hashed = await bcryptUtil.hash(password);

    // Tạo user mới
    const user = await userRepository.create({
      name: fullname,
      email,
      password: hashed,
      role: 'user'
    });

    // Trả về dữ liệu user (không bao gồm password)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      address: user.address || null
    };
  }

  async login(data) {
    const { email, password } = data;

    // Kiểm tra email tồn tại
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Email hoặc mật khẩu không chính xác');

    // Kiểm tra mật khẩu
    const isMatch = await bcryptUtil.compare(password, user.password);
    if (!isMatch) throw new Error('Email hoặc mật khẩu không chính xác');

    // Tạo JWT token
    const token = jwtUtil.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Trả về user response mà không có password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    
    return { 
      token,
      user: userWithoutPassword 
    };
  }

  /**
   * Gửi email quên mật khẩu. Nếu email tồn tại, tạo token giúp đổi mật khẩu.
   * Vì lý do bảo mật, response luôn trả success dù email không tồn tại.
   */
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) return; // do not reveal existence

    // tạo mã 6 chữ số
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // xóa mã hết hạn cũ
    await passwordResetRepo.deleteExpired();

    // lưu mã mới
    await passwordResetRepo.create({ user_id: user.id, code, expires_at: expiresAt });

    // gửi mail chứa code
    const subject = 'Mã đặt lại mật khẩu của bạn';
    const html = `<p>Xin chào ${user.name || user.email},</p>
      <p>Mã đặt lại mật khẩu của bạn là: <strong>${code}</strong></p>
      <p>Mã có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`;
    await emailUtil.sendMail({ to: user.email, subject, html });
  }

  /**
   * Forward-compatible helper that sends a **token link** instead of the
   * numeric OTP.  This keeps `forgotPassword` unchanged so existing callers
   * continue getting OTP codes, but provides a separate method for cases where
   * a one‑time JWT link is desired.
   */
  async forgotPasswordToken(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) return;

    // generate single-use token with 1h expiration
    const token = jwtUtil.generateToken({ id: user.id }, '1h');
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const subject = 'Liên kết đặt lại mật khẩu của bạn';
    const html = `<p>Xin chào ${user.name || user.email},</p>
      <p>Nhấn vào liên kết sau để đặt lại mật khẩu của bạn:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Liên kết có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`;

    await emailUtil.sendMail({ to: user.email, subject, html });
  }

  /**
   * Request reset code by email and code verification
   */
  async resetPasswordWithCode(email, code, newPassword) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Email hoặc code không hợp lệ');

    // tìm mã hợp lệ
    const reset = await passwordResetRepo.findValidByCode(user.id, code);
    if (!reset) throw new Error('Code không hợp lệ hoặc đã hết hạn');

    // đổi mật khẩu
    const hashed = await bcryptUtil.hash(newPassword);
    await userRepository.update(user.id, { password: hashed });

    // đánh dấu đã dùng
    await passwordResetRepo.markUsed(reset.id);
  }

  /**
   * Đặt lại mật khẩu bằng token xác thực từ email.
   */
  // token-based reset is no longer used by the application.  If the route
  // is ever reinstated this helper can be restored or rewritten.
  async resetPassword(token, newPassword) {
    try {
      const decoded = jwtUtil.verifyToken(token);
      const user = await userRepository.findById(decoded.id);
      if (!user) throw new Error('Không tìm thấy người dùng');

      const hashed = await bcryptUtil.hash(newPassword);
      await userRepository.update(user.id, { password: hashed });
    } catch (err) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}

module.exports = new AuthService();