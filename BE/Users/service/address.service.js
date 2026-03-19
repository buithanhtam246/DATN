const addressRepo = require('../repository/address.repository');
const { sequelize } = require('../../config/database');

class AddressService {
  async listForUser(userId) {
    return addressRepo.findAllByUser(userId);
  }

  async getDefault(userId) {
    return addressRepo.findDefaultByUser(userId);
  }

  async getDefaultAddress(userId) {
    return addressRepo.findDefaultByUser(userId);
  }

  async create(userId, data) {
    return sequelize.transaction(async (t) => {
      if (data.is_default) {
        // Truyền t để thực hiện trong cùng một phiên làm việc
        await addressRepo.clearDefault(userId, t);
      }
      // QUAN TRỌNG: Phải truyền t vào đây
      return addressRepo.create({ ...data, user_id: userId }, t);
    });
  }

  async update(userId, addressId, data) {
    return sequelize.transaction(async (t) => {
      if (data.is_default) {
        await addressRepo.clearDefault(userId, t);
      }
      
      const address = await addressRepo.findById(addressId);
      if (!address || address.user_id !== userId) {
        throw new Error('Address not found');
      }

      // Truyền t vào hàm update
      await addressRepo.update(addressId, data, t);
      return addressRepo.findById(addressId);
    });
  }

  async remove(userId, addressId) {
    const address = await addressRepo.findById(addressId);
    if (!address || address.user_id !== userId) {
      throw new Error('Address not found');
    }
    return addressRepo.delete(addressId);
  }

  async setDefault(userId, addressId) {
    return sequelize.transaction(async (t) => {
      const address = await addressRepo.findById(addressId);
      if (!address || address.user_id !== userId) {
        throw new Error('Address not found');
      }
      await addressRepo.clearDefault(userId, t);
      // Truyền t vào hàm update
      await addressRepo.update(addressId, { is_default: true }, t);
      return addressRepo.findById(addressId);
    });
  }
}

module.exports = new AddressService();