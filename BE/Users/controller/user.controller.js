const userService = require('../service/user.service');
const addressService = require('../service/address.service');
const User = require('../model/user.model');
const Order = require('../model/Order.model');
const { sequelize } = require('../../config/database');

class UserController {
  // Lấy tất cả users (cho admin)
  async getAllUsers(req, res) {
    try {
      // Lấy danh sách users với thống kê đơn hàng
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'phone', 'role'],
        include: [
          {
            model: Order,
            as: 'orders',
            attributes: ['id', 'total_price'],
            required: false
          }
        ],
        order: [['id', 'DESC']]
      });

      // Tính toán thống kê cho từng user
      const usersWithStats = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        totalOrders: user.orders ? user.orders.length : 0,
        totalSpent: user.orders ? user.orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0) : 0
      }));

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách người dùng thành công',
        data: usersWithStats
      });
    } catch (err) {
      console.error('getAllUsers error:', err);
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  // Lấy thông tin tài khoản của user đang đăng nhập
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await userService.getUserProfile(userId);
      
      res.status(200).json({
        success: true,
        message: 'Lấy thông tin tài khoản thành công',
        data: user
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  // Cập nhật thông tin tài khoản
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, phone } = req.body;

      if (!name || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Tên và số điện thoại không được để trống'
        });
      }

      const updatedUser = await userService.updateUserProfile(userId, {
        name,
        phone
      });

      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin tài khoản thành công',
        data: updatedUser
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  // Lấy thông tin tài khoản kèm địa chỉ mặc định
  async getProfileWithDefaultAddress(req, res) {
    try {
      const userId = req.user.id;
      const userProfile = await userService.getUserProfile(userId);
      const defaultAddress = await addressService.getDefaultAddress(userId);

      res.status(200).json({
        success: true,
        message: 'Lấy thông tin tài khoản thành công',
        data: {
          ...userProfile,
          default_address: defaultAddress
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new UserController();
