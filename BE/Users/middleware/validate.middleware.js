const validateRegister = (req, res, next) => {
  const { fullname, email, password, confirmPassword } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!fullname || !email || !password || !confirmPassword) {
    return res.status(400).json({ 
      success: false,
      message: 'Vui lòng điền đầy đủ thông tin' 
    });
  }

  // Kiểm tra tên không trống
  if (fullname.trim().length < 3) {
    return res.status(400).json({ 
      success: false,
      message: 'Tên phải có ít nhất 3 ký tự' 
    });
  }

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: 'Email không hợp lệ' 
    });
  }

  // Kiểm tra độ dài mật khẩu
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false,
      message: 'Mật khẩu phải có ít nhất 6 ký tự' 
    });
  }

  // Kiểm tra xác nhận mật khẩu
  if (password !== confirmPassword) {
    return res.status(400).json({ 
      success: false,
      message: 'Mật khẩu xác nhận không trùng khớp' 
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Vui lòng nhập email và mật khẩu' 
    });
  }

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: 'Email không hợp lệ' 
    });
  }

  // Kiểm tra độ dài mật khẩu
  if (password.length < 6) {
    return res.status(400).json({ 
      message: 'Mật khẩu phải có ít nhất 6 ký tự' 
    });
  }

  next();
};

const validateForgot = (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Vui lòng cung cấp email' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email không hợp lệ' });
  }
  next();
};

// validator for token-based password reset (link flow)
const validateReset = (req, res, next) => {
  const { token, password, confirmPassword } = req.body;
  if (!token || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Thiếu token hoặc mật khẩu' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Mật khẩu xác nhận không trùng' });
  }
  next();
};

const validateResetWithCode = (req, res, next) => {
  const { email, code, password, confirmPassword } = req.body;
  if (!email || !code || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Thiếu tham số' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ message: 'Email không hợp lệ' });
  if (password.length < 6) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  if (password !== confirmPassword) return res.status(400).json({ message: 'Mật khẩu xác nhận không trùng' });
  next();
};

// validate address payload for create/update
const validateAddress = (req, res, next) => {
  const { receiver_name, receiver_phone, full_address } = req.body;
  if (!receiver_name || !receiver_phone || !full_address) {
    return res.status(400).json({ message: 'Vui lòng cung cấp tên, số điện thoại và địa chỉ' });
  }
  // simple length checks
  if (receiver_name.trim().length < 2) {
    return res.status(400).json({ message: 'Tên người nhận không hợp lệ' });
  }
  if (receiver_phone.trim().length < 8) {
    return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgot,
  validateResetWithCode,
  validateReset,
  validateAddress
};
