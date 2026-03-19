// const Address = require('../model/address.model');

// class AddressRepository {
//   create(data) {
//     return Address.create(data);
//   }

//   findById(id) {
//     return Address.findByPk(id);
//   }

//   findAllByUser(userId) {
//     return Address.findAll({ where: { user_id: userId } });
//   }

//   findDefaultByUser(userId) {
//     return Address.findOne({ where: { user_id: userId, is_default: true } });
//   }

//   update(id, data) {
//     return Address.update(data, { where: { id } });
//   }

//   delete(id) {
//     return Address.destroy({ where: { id } });
//   }

//   // helper to clear default flag for a user's addresses
//   async clearDefault(userId, transaction) {
//     return Address.update({ is_default: false }, { where: { user_id: userId }, transaction });
//   }
// }

// module.exports = new AddressRepository();
const Address = require('../model/address.model');

class AddressRepository {
  async findAllByUser(user_id) {
    return Address.findAll({ where: { user_id } });
  }

  async findById(id) {
    return Address.findByPk(id);
  }

  async findDefaultByUser(user_id) {
    return Address.findOne({ where: { user_id, is_default: true } });
  }

  // Nhận transaction từ service truyền xuống
  async create(data, transaction) {
    return Address.create(data, { transaction });
  }

  // Nhận transaction để xóa trạng thái mặc định cũ
  async clearDefault(user_id, transaction) {
    return Address.update(
      { is_default: false },
      { where: { user_id, is_default: true }, transaction }
    );
  }

  // Nhận transaction để cập nhật
  async update(id, data, transaction) {
    return Address.update(data, { where: { id }, transaction });
  }

  async delete(id) {
    return Address.destroy({ where: { id } });
  }
}

module.exports = new AddressRepository();