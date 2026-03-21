const userRepository = require('../repository/user.repository');
const bcryptUtil = require('../utils/bcrypt.util');
const jwtUtil = require('../utils/jwt.util');
const emailUtil = require('../utils/email.util');
const addressService = require('./address.service');

class AuthService {
  async register(data) {
    const { fullname, email, password, confirmPassword } = data;

    // Validation
    if (!fullname || !email || !password || !confirmPassword) {
      throw new Error('Vui lòng nhập đầy đủ thông tin');
    }

    if (password !== confirmPassword) {
      throw new Error('Mật khẩu xác nhận không trùng');
    }

    // Validation mật khẩu mạnh
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt');
    }

    // Kiểm tra email đã tồn tại
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error('Email đã tồn tại');

    // Mã hóa mật khẩu
    const hashed = await bcryptUtil.hash(password);

    // Role mặc định với register công khai là user
    const userRole = 'user';

    // Tạo user mới
    const user = await userRepository.create({
      name: fullname,
      email,
      password: hashed,
      role: userRole
    });

    // Trả về dữ liệu user (không bao gồm password).  Address/phone
    // information is now handled via the address book endpoints so we
    // only return the core user fields here.
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  async registerAdmin(data) {
    const { fullname, email, password, confirmPassword, role } = data;

    if (!fullname || !email || !password || !confirmPassword) {
      throw new Error('Vui lòng nhập đầy đủ thông tin');
    }

    if (password !== confirmPassword) {
      throw new Error('Mật khẩu xác nhận không trùng');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt');
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error('Email đã tồn tại');

    const normalizedRole = (role || 'admin').trim().toLowerCase();
    if (normalizedRole !== 'admin') {
      throw new Error('Chỉ admin mới có thể tạo tài khoản admin');
    }

    const hashed = await bcryptUtil.hash(password);
    const user = await userRepository.create({
      name: fullname,
      email,
      password: hashed,
      role: 'admin'
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  async login(data) {
    const { email, password } = data;

    // Kiểm tra email tồn tại
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Email không tồn tại');

    // Kiểm tra mật khẩu
    const isMatch = await bcryptUtil.compare(password, user.password);
    if (!isMatch) throw new Error('Sai mật khẩu');

    // Tạo JWT token
    const token = jwtUtil.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Trả về user response mà không có password.  Include default
    // address as convenience.
    const { password: _, ...userWithoutPassword } = user.toJSON();
    const defaultAddr = await addressService.getDefault(user.id);
    
    return {
      token,
      user: {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        phone: userWithoutPassword.phone,
        role: userWithoutPassword.role,
        default_address: defaultAddr || null
      }
    };
  }

  /**
   * Gửi email quên mật khẩu. Nếu email tồn tại, tạo mã 6 chữ số và lưu vào user.
   * Vì lý do bảo mật, response luôn trả success dù email không tồn tại.
   */
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) return; // do not reveal existence

    // tạo mã 6 chữ số
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // lưu mã vào user
    await userRepository.update(user.id, { otp: code, otp_expires: expiresAt });

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

    // kiểm tra mã và thời hạn
    if (user.otp !== code || user.otp_expires <= new Date()) {
      throw new Error('Code không hợp lệ hoặc đã hết hạn');
    }

    // đổi mật khẩu và xóa OTP
    const hashed = await bcryptUtil.hash(newPassword);
    await userRepository.update(user.id, { password: hashed, otp: null, otp_expires: null });
  }

  async verifyResetCode(email, code) {
    const user = await userRepository.findByEmail(email);
    if (!user) return false;

    // kiểm tra mã và thời hạn
    if (user.otp === code && user.otp_expires > new Date()) {
      return true;
    }
    return false;
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

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User không tồn tại');

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcryptUtil.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('Mật khẩu hiện tại không đúng');

    // Kiểm tra mật khẩu mới không trùng với cũ
    const isSame = await bcryptUtil.compare(newPassword, user.password);
    if (isSame) throw new Error('Mật khẩu mới không được trùng với mật khẩu cũ');

    // Mã hóa mật khẩu mới
    const hashed = await bcryptUtil.hash(newPassword);
    await userRepository.update(userId, { password: hashed });
  }
}

module.exports = new AuthService();