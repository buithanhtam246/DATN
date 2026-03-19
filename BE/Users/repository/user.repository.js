const User = require('../model/user.model');

class UserRepository {
  findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  findById(id) {
    // include addresses when fetching individual user (useful for
    // returning profile info with address book)
    return User.findByPk(id, {
      include: [
        {
          association: 'addresses'
        }
      ]
    });
  }

  create(data) {
    return User.create(data);
  }

  findAll() {
    return User.findAll();
  }

  update(id, data) {
    return User.update(data, { where: { id } });
  }

  delete(id) {
    return User.destroy({ where: { id } });
  }
}

module.exports = new UserRepository();